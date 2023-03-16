import { PlayerService } from '@app/services/player/player-service';
import { ServerTimeService } from '@app/services/time/server-time.service';
import { DELAY_BEFORE_EMITTING_TIME } from '@common/const-chat-gateway';
import { PlayerEntity, PlayerMulti } from '@common/player';
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
    roomName: string = '';
    // create a list of Players
    playersQueue: PlayerMulti[] = [];

    constructor(private readonly logger: Logger, private readonly playerService: PlayerService, private readonly serverTime: ServerTimeService) {}

    @SubscribeMessage(ChatEvents.Connect)
    connect(_: Socket, message: string) {
        this.server.emit(ChatEvents.Message, `Message reçu : ${message}`);
        this.logger.log('connection au socket');
    }

    @SubscribeMessage(ChatEvents.JoinRoomSolo)
    async joinRoomSolo(socket: Socket, playerName: string) {
        const startTime = new Date();
        this.logger.log('joinRoom', playerName);
        this.socketId = socket.id;
        const player: PlayerEntity = {
            playerName,
            socketId: socket.id,
        };
        if ((await this.playerService.getRoomIndex(socket.id)) === INDEX_NOT_FOUND) {
            this.roomName = this.socketId;
            socket.emit(ChatEvents.Hello, `${this.roomName}`);
            await this.playerService.addRoomSolo(socket.id, player, startTime);
            if (!this.serverTime.timers[player.socketId]) {
                this.serverTime.startChronometer(player.socketId);
            }
            socket.join(player.socketId);
        } else {
            this.logger.log('room already exists');
        }
        this.logger.log(this.playerService.rooms);
    }

    @SubscribeMessage(ChatEvents.SendRoomName)
    async sendRoomName(socket: Socket, roomName: string) {
        this.roomName = roomName;
        socket.emit('sendRoomName', ['multi', this.roomName]);
        if (!this.serverTime.timers[this.roomName]) {
            this.serverTime.startChronometer(this.roomName);
        }
    }

    @SubscribeMessage(ChatEvents.StartMultiGame)
    async startMultiGame(socket: Socket, player: { gameId: string; creatorName: string; gameName: string; opponentName: string }) {
        this.playersQueue.push({
            socketId: socket.id,
            id: player.gameId,
            creatorName: player.creatorName,
            gameName: player.gameName,
            opponentName: player.opponentName,
        });
        const myPlayers: PlayerMulti[] = this.playersMatch();
        socket.join(player.gameId + player.gameName);
        if (myPlayers.length === 2) {
            const player1: PlayerEntity = {
                playerName: myPlayers[0].creatorName,
                socketId: myPlayers[0].socketId,
            };
            const player2: PlayerEntity = {
                playerName: myPlayers[1].creatorName,
                socketId: myPlayers[1].socketId,
            };
            this.playerService.addRoomMulti(myPlayers[0].id, [player1, player2], new Date());
        }
    }

    @SubscribeMessage(ChatEvents.LeaveRoom)
    async leaveRoom(socket: Socket) {
        await this.playerService.removeRoom(socket.id);
        socket.leave(socket.id);
    }

    // TODO:  handle timer deletion
    @SubscribeMessage(ChatEvents.StopTimer)
    async stopTimer(socket: Socket, roomName: string) {
        socket.to(roomName).emit('gameEnded', true);
        this.serverTime.stopChronometer(roomName); // maybe change the return value
        this.serverTime.removeTimer(roomName);
    }

    @SubscribeMessage(ChatEvents.Message)
    async message(socket: Socket, data: [string, string, string, string, string, boolean]) {
        console.log('message send by client',data)
        socket.to(data[4]).emit('message-return', { message: data[0], userName: data[1], color: data[2], pos: data[3], event: data[5] });
    }

    @SubscribeMessage(ChatEvents.FindDifference)
    async findDifference(socket: Socket, information: { playerName: string; roomName: string }) {
        socket.to(information.roomName).emit('findDifference-return', { playerName: information.playerName });
    }

    @SubscribeMessage(ChatEvents.FeedbackDifference)
    async differenceFound(socket: Socket, data) {
        socket.to(data[1]).emit('feedbackDifference', data[0]);
    }

    @SubscribeMessage(ChatEvents.GameEnded)
    async gameEnded(socket: Socket, roomName: string) {
        // to be private
        this.serverTime.removeTimer(roomName);
        this.playerService.removeRoom(roomName);
        this.playerService.roomNamesMulti.filter((name) => name !== roomName);
        this.logger.log('game ended');
        this.logger.log(this.roomName);
        socket.leave(roomName);
    }
    @SubscribeMessage(ChatEvents.SendGiveUp)
    async sendGiveUp(socket: Socket, information: { playerName: string; roomName: string }) {
        this.logger.log(information);
        socket.broadcast.to(information.roomName).emit('giveup-return', { playerName: information.playerName });
        this.logger.log('should send to client');
    }

    async handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id} `);
        // console.log(this.playerService.rooms);
        this.socketId = socket.id;
        socket.emit(ChatEvents.GetRooms, this.playerService.rooms);
    }

    // TODO:  handle rooms deletion
    async handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id} `);
        // await this.playerService.removeRoom(socket.id);
        // socket.leave(this.roomName);
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

    private playersMatch(): PlayerMulti[] {
        const idMap = new Map<string, PlayerMulti>();
        for (const obj of this.playersQueue) {
            if (idMap.has(obj.id)) {
                this.removePlayerFromQueue(obj);
                this.removePlayerFromQueue(idMap.get(obj.id));
                return [idMap.get(obj.id), obj];
            }
            idMap.set(obj.id, obj);
        }
        return [];
    }

    private removePlayerFromQueue(player: PlayerMulti): void {
        this.playersQueue = this.playersQueue.filter((p) => p.id !== player.id);
    }
}
