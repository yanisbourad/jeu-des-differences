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
    nHints: number = 0;
    roomName: string = '';
    socketId: string = '';

    constructor(private readonly logger: Logger, private readonly playerService: PlayerService, private readonly timeService: TimeService) {}

    @SubscribeMessage(ChatEvents.Connect)
    connect(socket: Socket, message: string) {
        this.server.emit(ChatEvents.MassMessage, `: ${message}`);
        this.logger.log('connection au socket');
        //this.socketId = socket.id;
    }

    @SubscribeMessage(ChatEvents.NbrHint)
    NbrHint(_: Socket, hints: number) {
        this.nHints = hints;
    }

    @SubscribeMessage(ChatEvents.SendRoomName)
    RoomName(socket: Socket) {
        this.roomName = socket.id;
    }

    @SubscribeMessage(ChatEvents.Time)
    async Time(socket: Socket,time: number) {
        this.clientTime = time;
        const room = await this.playerService?.getRoom(socket.id);
        const startTime = room ? room.startTime : null;
        if (this.hintUsed) { // to remove cause hints not to implement in sprint 1
            this.timeService.nHints++;
            this.hintUsed = false;
        }
        //console.log(this.getSocketId(), "socket")
       console.log('time: ', this.timeService.getElaspedTime(startTime))
        // , 'clientTime: ', this.clientTime)
        // const count = this.timeService.getElaspedTime(startTime);
        // console.log(count)
        // if (room) {
        //     console.log(room.name)
        //     socket.emit(ChatEvents.Time, [room.name, this.clientTime]);
        // }    
    }

    @SubscribeMessage(ChatEvents.AddTime)
    async addTime(socket: Socket, data: [number, string]) {
        this.hintUsed = true;
        this.timeService.penalty = data[0];
        const room = await this.playerService.getRoom(data[1]);
        if (room.nHints != 0) {
            room.nHints--;
            this.nHints++;
            socket.emit(ChatEvents.NbrHint, room.nHints);
        }
    }

    @SubscribeMessage(ChatEvents.JoinRoom)
    async joinRoom(socket: Socket, playerName: string) {
        const startTime = new Date();
        const DEFAULT_HINTS = 3;
        const player: Player = {
            playerName,
            socketId: socket.id,
        };
        console.log('player: ', player)
        if (( await this.playerService.getRoomIndex(socket.id) === -1  )) {
            await this.playerService.addRoom(player.socketId, player, startTime, DEFAULT_HINTS);
            socket.emit(ChatEvents.NbrHint, DEFAULT_HINTS);
            socket.join(player.socketId);
        } else {
            this.playerService.addPlayer(player.socketId, player, startTime, DEFAULT_HINTS);
            socket.join(player.socketId);
        }
    }

    @SubscribeMessage(ChatEvents.LeaveRoom)
    async leaveRoom(socket: Socket, roomName: string) {
        const room = await this.playerService.getRoom(roomName);
        room.startTime = null;
        this.playerService.removePlayer(roomName, socket.id);
        socket.leave(roomName);
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id} `);// maybe use to disconnect
        this.socketId = socket.id;
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

    getSocketId(){
        return this.socketId;
    }

    validateServerClientTime(serverTime: number): boolean {
        return serverTime === this.clientTime;
    }
}
