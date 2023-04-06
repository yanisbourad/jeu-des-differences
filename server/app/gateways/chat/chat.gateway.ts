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
    gameName: string = '';
    isTimeLimit: boolean = false;
    isMulti: boolean = false;
    // create a queue of Players
    gameNames: string[];
    playersQueue: PlayerMulti[] = [];
    unfoundedDifference: Map<string, Set<number>[]> = new Map<string, Set<number>[]>();
    games: Map<string, Game> = new Map<string, Game>();
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
    async joinRoomSolo(socket: Socket, data: { playerName: string; gameName: string }) {
        this.logger.debug('solo');
        const game = this.gameService.getGame(data.gameName);
        this.unfoundedDifference.set(socket.id, this.gameService.getSetDifference(game.listDifferences));
        const startTime = new Date();
        const player: PlayerEntity = {
            playerName: data.playerName,
            socketId: socket.id,
        };
        if ((await this.playerService.getRoomIndex(socket.id)) === INDEX_NOT_FOUND) {
            socket.emit(ChatEvents.Hello, `${socket.id}`);
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
    async startSoloTimeLimit(socket: Socket, playerName: string) {
        this.roomName = socket.id;
        this.gameNames = this.gameService.gamesNames;
        this.games = this.gameService.getGames();
        this.game = this.games.get(this.chooseRandomName());
        this.unfoundedDifference.set(this.roomName, this.gameService.getSetDifference(this.game.listDifferences));
        this.playerName = playerName;
        socket.join(this.roomName);
        socket.emit(ChatEvents.Hello, `${socket.id}`);
        if (!this.serverTime.timers[this.roomName]) {
            this.serverTime.startCountDown(this.roomName);
        }
        this.server.to(this.roomName).emit('getRandomGame', this.game);
        // add room maybe
    }

    @SubscribeMessage(ChatEvents.SendRoomName)
    async sendRoomName(socket: Socket, roomName: string) {
        this.logger.debug('sendRoomName');
        const game = this.gameService.getGame(this.gameName);
        this.roomName = roomName;
        this.unfoundedDifference.set(this.roomName, this.gameService.getSetDifference(game.listDifferences));
        socket.emit('sendRoomName', ['multi', this.roomName]);
        socket.join(this.roomName);
        this.logger.debug(this.unfoundedDifference.size);
        if (!this.serverTime.timers[this.roomName]) {
            this.logger.debug('start');
            this.serverTime.startChronometer(this.roomName);
        }
    }

    @SubscribeMessage(ChatEvents.StartMultiGame)
    async startMultiGame(socket: Socket, player: { gameId: string; creatorName: string; gameName: string; opponentName: string }) {
        this.logger.debug('multi');
        this.playersQueue.push({
            socketId: socket.id,
            id: player.gameId,
            creatorName: player.creatorName,
            gameName: player.gameName,
            opponentName: player.opponentName,
        });
        this.isMulti = true;
        this.gameName = player.gameName;
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
        if (data[1] === 'meilleur temps') {
            socket.broadcast.emit('message-return', { message: data[0], userName: data[1], color: data[2], pos: data[3], event: data[5] });
        } else {
            socket.to(data[4]).emit('message-return', { message: data[0], userName: data[1], color: data[2], pos: data[3], event: data[5] });
        }
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
    async mouseDetect(socket: Socket, data: [position: number, roomName: string, mode: string]) {
        if (!this.isMulti) {
            this.roomName = socket.id;
        } else {
            this.roomName = data[1];
        }
        const diff = this.unfoundedDifference.get(this.roomName).find((set) => set.has(data[0]));
        if (diff) {
            if (data[2]) {
                this.logger.debug('here');
                this.serverTime.incrementTime(); // work!
                this.goToNextGame(); // to implement game switching
            }
            socket.emit('diffFound', Array.from(diff));
        } else {
            socket.emit('error');
        }
        const sets = this.unfoundedDifference.get(this.roomName);
        if (sets) {
            this.unfoundedDifference.set(
                this.roomName,
                sets.filter((set) => !set.has(data[0])),
            );
        }
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

    async handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id: ${socket.id} `);
    }

    async handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id: ${socket.id} `);
        await this.playerService.removeRoom(this.roomName);
        // this.serverTime.removeTimer(socket.id);
        socket.leave(this.roomName);
    }

    afterInit() {
        this.emitTime();
    }

    defineDifferences(roomName: string, diffList: string[]): void {
        this.unfoundedDifference.set(roomName, this.gameService.getSetDifference(diffList));
    }
    emitTime(): void {
        // to be private
        setInterval(() => {
            if (this.serverTime.countDown === 0) {
                this.serverTime.removeTimer(this.roomName);
                this.server.to(this.roomName).emit('timeLimitStatus', false);
            }
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

    chooseRandomName(): string {
        return this.gameNames[Math.floor(Math.random() * this.gameNames.length)];
    }

    goToNextGame(): void {
        if (this.gameNames.length !== 1) {
            this.gameNames = this.gameNames.filter((name) => name !== this.game.gameName);
            this.game = this.games.get(this.chooseRandomName());
            this.server.to(this.roomName).emit('getRandomGame', this.game);
            this.unfoundedDifference.set(this.roomName, this.gameService.getSetDifference(this.game.listDifferences));
        } else {
            this.server.to(this.roomName).emit('timeLimitStatus', true);
        }
    }
}
