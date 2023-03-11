import { PlayerService } from '@app/services/player/player-service';
import { ServerTimeService } from '@app/services/time/server-time.service';
import { DELAY_BEFORE_EMITTING_TIME } from '@common/const-chat-gateway';
import { Player } from '@common/player';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { INDEX_NOT_FOUND, PRIVATE_ROOM_ID } from './chat.gateway.constants';
import { ChatEvents } from './chat.gateway.events';
@WebSocketGateway({ namespace: '/api', cors: true, transport: ['websocket'] })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server;
    socketId: string = '';
    roomName: string = '';
    private readonly room = PRIVATE_ROOM_ID;
    constructor(private readonly logger: Logger, private readonly playerService: PlayerService, private readonly serverTime: ServerTimeService) {}

    @SubscribeMessage(ChatEvents.Connect)
    connect(socket: Socket, message: string) {
        this.server.emit(ChatEvents.Message, `Message reçu : ${message}`);
        this.logger.log('connection au socket');
    }

    @SubscribeMessage(ChatEvents.JoinRoomSolo)
    async joinRoomSolo(socket: Socket, playerName: string) {
        const startTime = new Date();
        this.logger.log('joinRoom', playerName);
        this.socketId = socket.id;
        const player: Player = {
            playerName,
            socketId: socket.id,
        };
        if ((await this.playerService.getRoomIndex(socket.id)) === INDEX_NOT_FOUND) {
            await this.playerService.addRoomSolo(socket.id, player, startTime);
            if (!this.serverTime.timers[player.socketId]) {
                this.serverTime.startChronometer(socket.id);
            }
            socket.join(player.socketId);
        } else {
            this.logger.log('room already exists');
        }
        this.logger.log(this.playerService.rooms);
    }

    @SubscribeMessage(ChatEvents.JoinRoomMulti)
    async joinRoomMulti(socket: Socket, data: [playerName1: string, playerName2: string]) {
        // to modify to have a different socket id
        const startTime = new Date();
        this.logger.log('joinRoom', data); //
        this.socketId = socket.id;
        const player1: Player = {
            playerName: data[0],
            socketId: socket.id,
        };
        const player2: Player = {
            playerName: data[1],
            socketId: socket.id,
        };
        // change the condition to admit two players
        if ((await this.playerService.getRoomIndex(socket.id)) === INDEX_NOT_FOUND) {
            await this.playerService.addRoomMulti(socket.id, [player1, player2], startTime);
            if (!this.serverTime.timers[player1.socketId]) {
                this.serverTime.startChronometer(socket.id);
            }
            socket.join(this.roomName);
        } else {
            this.logger.log('room already exists');
        }
        // console.log(this.playerService.rooms);
        // console.log(this.playerService.rooms[0].players);
    }

    @SubscribeMessage(ChatEvents.LeaveRoom)
    async leaveRoom(socket: Socket) {
        await this.playerService.removeRoom(socket.id);
        socket.leave(socket.id);
    }

    @SubscribeMessage(ChatEvents.StopTimer)
    async stopTimer(_: Socket, roomName: string) {
        // not tested
        this.serverTime.stopChronometer(roomName); // maybe change the return value
    }
    @SubscribeMessage(ChatEvents.Message)
    async message(socket: Socket, data: [string, string]) {
        console.log(data[0]);
        socket.emit('message-return', { message: data[0], userName: data[1] });
    }

    // add event game finished to stop the timer
    async handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id} `);
        this.socketId = socket.id;
        if ((await this.playerService.getRoomIndex(socket.id)) === INDEX_NOT_FOUND) {
            this.roomName = this.socketId;
        }
        socket.emit(ChatEvents.Hello, `${this.roomName}`); // modif here
        socket.emit(ChatEvents.GetRooms, this.playerService.rooms);
    }

    async handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id} `);
        await this.playerService.removeRoom(socket.id);
        socket.leave(socket.id);
    }

    getSocketId() {
        return this.socketId;
    }

    afterInit() {
        this.emitTime();
    }

    emitTime(): void {
        // to be private
        setInterval(() => {
            this.server.emit(ChatEvents.ServerTime, Array.from(this.serverTime.elapsedTimes));
        }, DELAY_BEFORE_EMITTING_TIME);
    }
}
