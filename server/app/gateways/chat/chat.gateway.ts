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
    nHints:number = 0
    roomName: string = '';

    constructor(private readonly logger: Logger, private readonly playerService: PlayerService, private readonly timeService: TimeService) {}

    @SubscribeMessage(ChatEvents.Connect)
    connect(_: Socket, message: string) {
        this.server.emit(ChatEvents.MassMessage, `: ${message}`);
        this.logger.log('connection au socket');
    }


    @SubscribeMessage(ChatEvents.NbrHint)
    NbrHint(_: Socket, hints: number) {
       this.nHints = hints;
    }

    @SubscribeMessage(ChatEvents.SendRoomName)
    RoomName(_: Socket, roomName: string) {
       this.roomName = roomName;
    }

    @SubscribeMessage(ChatEvents.Time)
    async Time(socket: Socket, data: [time: number, roomName: string]) {
        this.clientTime = data[0];
        let room = await this.playerService.getRoom(data[1]);
        let startTime = room.startTime;
        if (this.hintUsed) {
            this.timeService.nHints++;
            this.hintUsed = false;
        }
        let count = this.timeService.getElaspedTime(startTime);
        if (!this.validateServerClientTime(count)) {
            socket.emit(ChatEvents.Time, [room.name, count]);
        }
    }

    @SubscribeMessage(ChatEvents.AddTime)
    async addTime(socket: Socket, data:[ number,string]) {
        this.hintUsed = true;
        this.timeService.penalty = data[0];
        let room = await this.playerService.getRoom(data[1]);
        if(room.nHints != 0){
            room.nHints--;
            this.nHints++;
            socket.emit(ChatEvents.NbrHint, room.nHints);
        }
    }

    @SubscribeMessage(ChatEvents.JoinRoom)
    async joinRoom(socket: Socket, playerName: string) {
        let startTime = new Date();
        let DEFAULT_HINTS = 3;
        const player: Player = {
            playerName: playerName,
            socketId: socket.id,
        };
        if ((await this.playerService.getRoomIndex(this.roomName)) == -1) {
            await this.playerService.addRoom(this.roomName, player, startTime, DEFAULT_HINTS);
            socket.emit(ChatEvents.NbrHint, DEFAULT_HINTS);
            socket.join(this.roomName);
        } else {
            this.playerService.addPlayer(this.roomName, player, startTime, DEFAULT_HINTS);
            socket.join(this.roomName);
        }
    }

    @SubscribeMessage(ChatEvents.LeaveRoom)
    async leaveRoom(socket: Socket, roomName: string) {
      //  this.playerService.removeRoom(roomName);
        let room = await this.playerService.getRoom(roomName);
        room.startTime = null;
        this.playerService.removePlayer(roomName, socket.id);
        console.log('leave room',this.playerService.rooms)
        socket.leave(roomName);
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id} `);
        socket.emit(ChatEvents.Hello, 'Hello from serveur');
        socket.emit(ChatEvents.NbrHint, 3);
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id} `);
        this.playerService.removeRoom(this.roomName);
        socket.leave(this.roomName);
        this.timeService.resetTime();
    }

    afterInit() {
        this.logger.log('Initialisation du socket');
    }

    validateServerClientTime(serverTime: number): boolean {
        return serverTime === this.clientTime;
    }
}
