import { GameService } from '@app/services/game/game.service';
import { PlayerService } from '@app/services/player/player-service';
import { ServerTimeService } from '@app/services/time/server-time.service';
import { DELAY_BEFORE_EMITTING_TIME } from '@common/const-chat-gateway';
import { PlayerEntity, PlayerMulti } from '@common/player';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { INDEX_NOT_FOUND } from './chat.gateway.constants';
import { ChatEvents } from './chat.gateway.events';
import { Game } from '@common/game';
@WebSocketGateway({ namespace: '/api', cors: true, transport: ['websocket'] })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server;
    roomName: string = '';
    playerName: string = '';
    isTimeLimit: boolean = false;
    // create a queue of Players
    playersQueue: PlayerMulti[] = [];
    unfoundedDifference: Set<number>[] = new Array();
    games: Game[] = new Array();
    game: Game;
    constructor(
        private readonly logger: Logger,
        private readonly playerService: PlayerService,
        private readonly serverTime: ServerTimeService,
        private readonly gameService: GameService,
    ) {}

    @SubscribeMessage(ChatEvents.Connect)
    connect(_: Socket, message: string) {
        this.server.emit(ChatEvents.Message, `Message reçu : ${message}`);
        this.logger.log('connection au socket');
    }

    @SubscribeMessage(ChatEvents.JoinRoomSolo)
    async joinRoomSolo(socket: Socket, playerName: string) {
        const startTime = new Date();
        const player: PlayerEntity = {
            playerName,
            socketId: socket.id,
        };
        if ((await this.playerService.getRoomIndex(socket.id)) === INDEX_NOT_FOUND) {
            this.roomName = socket.id;
            socket.emit(ChatEvents.Hello, `${this.roomName}`);
            await this.playerService.addRoomSolo(socket.id, player, startTime);
            if (!this.serverTime.timers[player.socketId]) {
                this.serverTime.startChronometer(player.socketId);
            }
            socket.join(player.socketId);
        } else {
            this.logger.log('room already exists');
        }
    }

    @SubscribeMessage(ChatEvents.StartSoloTimeLimit)
    async startSoloTimeLimit(socket: Socket, infos: { playerName: string; countDown: number }) {
        this.roomName = socket.id;
        this.loadRandomGame();
        this.defineDifferences();
        this.playerName = infos.playerName;
        this.isTimeLimit = true;
        socket.join(this.roomName);
        if (!this.serverTime.timers[this.roomName]) {
            this.serverTime.countDown = infos.countDown;
            this.serverTime.startCountDown(this.roomName);
        }
        // add room maybe
    }

    @SubscribeMessage(ChatEvents.SendRoomName)
    async sendRoomName(socket: Socket, roomName: string) {
        this.roomName = roomName;
        socket.emit('sendRoomName', ['multi', this.roomName]);
        socket.join(this.roomName);
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
        await this.playerService.removeRoom(this.roomName);
        socket.to(this.roomName).socketsLeave(this.roomName);
        socket.disconnect();
    }

    @SubscribeMessage(ChatEvents.StopTimer)
    async stopTimer(socket: Socket, data: [string, string]) {
        socket.to(data[0]).emit('gameEnded', [true, data[1]]);
        this.serverTime.stopChronometer(data[0]);
        this.serverTime.removeTimer(data[0]);
    }

    @SubscribeMessage(ChatEvents.Message)
    async message(socket: Socket, data: [string, string, string, string, string, boolean]) {
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

    @SubscribeMessage(ChatEvents.MousePosition)
    async mouseDetect(socket: Socket, position: number) {
        const diff = this.unfoundedDifference.find((set) => set.has(position));
        if (diff) {
            if (this.isTimeLimit) {
                console.log('timeLimit');
                this.deleteGameFromArray();
                // this.chooseRandomGame();
                this.serverTime.incrementTime(this.roomName);
            }; // doesn't work
            socket.emit('diffFound', Array.from(diff));
        } else {
            socket.emit('error');
        }
        this.unfoundedDifference = this.unfoundedDifference.filter((set) => set !== diff);
    }

    @SubscribeMessage(ChatEvents.GameEnded)
    async gameEnded(socket: Socket, roomName: string) {
        // to be private
        this.serverTime.removeTimer(roomName);
        this.playerService.removeRoom(roomName);
        socket.to(roomName).socketsLeave(roomName);
    }
    @SubscribeMessage(ChatEvents.SendGiveUp)
    async sendGiveUp(socket: Socket, information: { playerName: string; roomName: string }) {
        socket.to(information.roomName).emit('giveup-return', { playerName: information.playerName });
    }

    @SubscribeMessage(ChatEvents.RequestToGetGame)
    async getGame(socket: Socket, gameName: string) {
        this.game = this.gameService.getGame(gameName);
        this.defineDifferences();
        socket.emit('getGame', this.game);
    }

    async handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id: ${socket.id} `);
    }

    async handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id: ${socket.id} `);
        await this.playerService.removeRoom(this.roomName);
        socket.leave(this.roomName);
    }

    afterInit() {
        this.emitTime();
    }

    defineDifferences(): void {
        this.unfoundedDifference = this.gameService.getSetDifference(this.game.listDifferences);
    }
    emitTime(): void {
        // to be private
        setInterval(() => {
            this.serverTime.stopCountDown(this.roomName);
            if (this.serverTime.countDown === 0) this.server.to(this.roomName).emit('gameEnded', [true, this.playerName]);
            this.server.emit(ChatEvents.ServerTime, Array.from(this.serverTime.elapsedTimes));
        }, DELAY_BEFORE_EMITTING_TIME);
    }

    playersMatch(): PlayerMulti[] {
        const playerMap = new Map<string, PlayerMulti>();
        for (const player of this.playersQueue) {
            if (playerMap.has(player.id)) {
                this.removePlayerFromQueue(player);
                this.removePlayerFromQueue(playerMap.get(player.id));
                return [playerMap.get(player.id), player];
            }
            playerMap.set(player.id, player);
        }
        return [];
    }

    removePlayerFromQueue(player: PlayerMulti): void {
        this.playersQueue = this.playersQueue.filter((p) => p.id !== player.id);
    }

    loadRandomGame(): void {
        this.games = this.gameService.getGames();
        this.chooseRandomGame();
    }

    chooseRandomGame(): void {
        this.game = this.games[Math.floor(Math.random() * this.games.length)];
        this.server.emit('getGame', this.game);
    }

    deleteGameFromArray(): void {
        this.games = this.games.filter((game) => game !== this.game);
        console.log('arrayLength', this.games.length);
    }
}
