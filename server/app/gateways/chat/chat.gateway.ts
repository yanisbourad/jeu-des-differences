import { PlayerService } from '@app/services/player/player-service';
import { ServerTimeService } from '@app/services/time/server-time.service';
import { DELAY_BEFORE_EMITTING_TIME } from '@common/const-chat-gateway';
import { Player } from '@common/player';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { INDEX_NOT_FOUND } from './chat.gateway.constants';
import { ChatEvents } from './chat.gateway.events';
@WebSocketGateway({ namespace: '/api', cors: true, transport: ['websocket'] })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server;
    socketId: string = '';

    constructor(private readonly logger: Logger, private readonly playerService: PlayerService, private readonly serverTime: ServerTimeService) {}

    @SubscribeMessage(ChatEvents.Connect)
    connect(socket: Socket, message: string) {
        this.server.emit(ChatEvents.Message, `Message reçu : ${message}`);
        this.logger.log('connection au socket');
    }

    @SubscribeMessage(ChatEvents.JoinRoom)
    async joinRoom(socket: Socket, playerName: string) {
        const startTime = new Date();
        this.socketId = socket.id;
        const player: Player = {
            playerName,
            socketId: socket.id,
        };
        if ((await this.playerService.getRoomIndex(socket.id)) === INDEX_NOT_FOUND) {
            await this.playerService.addRoom(player.socketId, player, startTime);
            if (!this.serverTime.timers[player.socketId]) {
                this.serverTime.startChronometer(player.socketId);
            }
            socket.join(player.socketId);
        } else {
            this.playerService.addPlayer(player.socketId, player, startTime);
            socket.join(player.socketId);
        }
    }

    @SubscribeMessage(ChatEvents.LeaveRoom)
    async leaveRoom(socket: Socket) {
        await this.playerService.removeRoom(socket.id);
        socket.leave(socket.id);
    }

    // add event game finished to stop the timer

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id} `);
        this.socketId = socket.id;
        socket.emit(ChatEvents.Hello, `${socket.id}`);
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

    private emitTime(): void {
        setInterval(() => {
            this.server.emit(ChatEvents.ServerTime, Array.from(this.serverTime.elapsedTimes));
        }, DELAY_BEFORE_EMITTING_TIME);
    }
}
