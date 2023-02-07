import { PlayerService } from '@app/services/player/player-service';
import { TimeService } from '@app/services/time/time.service';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Player } from '../../../../client/src/app/interfaces/player';
import { ChatEvents } from './chat.gateway.events';
@WebSocketGateway({ namespace: '/api', cors: true, transport: ['websocket'] })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server;
    hintUsed: boolean = false;
    clientTime: number = 0;

    constructor(private readonly logger: Logger, private readonly playerService: PlayerService, private readonly timeService: TimeService) {}

    @SubscribeMessage(ChatEvents.Connect)
    connect(_: Socket, message: string) {
        this.server.emit(ChatEvents.MassMessage, `: ${message}`);
        this.logger.log('connection au socket');
    }

    @SubscribeMessage(ChatEvents.Time)
    async Time(socket: Socket, data: [time: number, roomName: string]) {
        this.clientTime = data[0];
        let room = await this.playerService.getRoom(data[1]);
        let startTime = room.startTime;
        if (this.hintUsed) {
            this.timeService.penalty++;
            this.hintUsed = false;
        }
        let count = this.timeService.getElaspedTime(startTime);
        if (!this.validateServerClientTime(count)) {
            socket.emit(ChatEvents.Time, [room.name, count]);
        }
    }

    @SubscribeMessage(ChatEvents.AddTime)
    addTime(_: Socket, time: number) {
        this.timeService.penalty = time;
        this.hintUsed = true;
    }

    @SubscribeMessage(ChatEvents.JoinRoom)
    async joinRoom(socket: Socket, playerName: string) {
        const roomName = playerName + ' room'; // to get from database
        let startTime = new Date();
        const player: Player = {
            playerName: playerName,
            socketId: socket.id,
        };
        if ((await this.playerService.getRoomIndex(roomName)) == -1) {
            await this.playerService.addRoom(roomName, player, startTime);
            socket.join(roomName);
        } else {
            this.playerService.addPlayer(roomName, player, startTime);
            socket.join(roomName);
        }
    }

    @SubscribeMessage(ChatEvents.LeaveRoom)
    leaveRoom(socket: Socket, playerName: string) {
        const roomName = playerName + ' room'; // to get from database
        socket.leave(roomName);
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id} `);
        socket.emit(ChatEvents.Hello, 'Hello from serveur');
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id} `);
    }

    afterInit() {
        this.logger.log('Initialisation du socket');
    }

    validateServerClientTime(serverTime: number): boolean {
        return serverTime === this.clientTime;
    }
}
