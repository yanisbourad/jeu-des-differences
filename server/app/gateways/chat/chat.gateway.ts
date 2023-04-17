import { GameService } from '@app/services/game/game.service';
import { ServerTimeService } from '@app/services/time/server-time.service';
import { DELAY_BEFORE_EMITTING_TIME } from '@common/const-chat-gateway';
import { Game } from '@common/game';
import { PlayerMulti } from '@common/player';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatEvents } from './chat.gateway.events';
@WebSocketGateway({ namespace: '/api', cors: true, transport: ['websocket'] })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server;
    roomName: string = '';
    playerName: string = '';
    gameName: string = '';
    isMulti: boolean = false;
    // create a queue of Players
    playersQueue: PlayerMulti[] = [];
    gameNames: string[];
    games: Map<string, Game> = new Map<string, Game>();
    isPlaying: Map<string, boolean> = new Map<string, boolean>();
    isTimeLimit: Map<string, boolean> = new Map<string, boolean>();
    unfoundedDifference: Map<string, Set<number>[]> = new Map<string, Set<number>[]>();
    game: Game;
    constructor(
        private readonly logger: Logger,
        private readonly serverTime: ServerTimeService,
        private readonly gameService: GameService,
    ) {}

    @SubscribeMessage(ChatEvents.Connect)
    connect(_: Socket) {
        this.logger.log('connection au socket');
    }

    @SubscribeMessage(ChatEvents.JoinRoomSolo)
    async joinRoomSolo(socket: Socket, data: { playerName: string; gameName: string }) {
        const game = this.gameService.getGame(data.gameName);
        this.unfoundedDifference.set(socket.id, this.gameService.getSetDifference(game.listDifferences));
        this.isPlaying.set(socket.id, true);
        socket.emit(ChatEvents.Hello, `${socket.id}`);
        if (!this.serverTime.timers[socket.id]) {
            this.serverTime.startChronometer(socket.id);
        }
        socket.join(socket.id);
    }

    @SubscribeMessage(ChatEvents.StartTimeLimit)
    async startTimeLimit(socket: Socket, playerName: string) {
        this.roomName = socket.id;
        this.setGame(playerName);
        socket.emit(ChatEvents.Hello, `${socket.id}`);
        if (!this.serverTime.timers[this.roomName]) {
            this.serverTime.startCountDown(this.roomName);
        }
        if (!socket.rooms.has(this.roomName)) socket.join(this.roomName);
        this.server.to(this.roomName).emit('getRandomGame', this.game);
        this.server.to(this.roomName).emit('nbrDifference', this.games.size);
    }

    @SubscribeMessage(ChatEvents.StartMultiTimeLimit)
    async startMultiTimeLimit(socket: Socket, player: { gameId: string; creatorName: string; gameName: string; opponentName: string; mode: string }) {
        this.playersQueue.push({
            socketId: socket.id,
            id: player.gameId,
            creatorName: player.creatorName,
            gameName: player.gameName,
            opponentName: player.opponentName,
        });
        const myPlayers: PlayerMulti[] = this.playersMatch();
        this.roomName = player.gameId + player.gameName;
        socket.join(this.roomName);
        if (myPlayers.length === 2) {
            this.isMulti = true;
            this.setGame('', player.gameName);
        }
    }

    @SubscribeMessage(ChatEvents.SendRoomName)
    async sendRoomName(socket: Socket, data: { roomName: string, mode: string }) {
        this.roomName = data.roomName;
        socket.join(this.roomName);
        if (data.mode) {
            socket.to(this.roomName).emit('getRandomGame', this.game);
            socket.to(this.roomName).emit('nbrDifference', this.games.size);
            if (!this.serverTime.timers[this.roomName]) {
                this.serverTime.startCountDown(this.roomName);
            }
        } else {
            const game = this.gameService.getGame(this.gameName);
            this.unfoundedDifference.set(this.roomName, this.gameService.getSetDifference(game.listDifferences));
            if (!this.serverTime.timers[this.roomName]) {
                this.serverTime.startChronometer(this.roomName);
            }
        }
        this.isPlaying.set(this.roomName, true);
        socket.emit('sendRoomName', ['multi', this.roomName]);
    }

    @SubscribeMessage(ChatEvents.StartMultiGame)
    async startMultiGame(socket: Socket, player: { gameId: string; creatorName: string; gameName: string; opponentName: string; mode?: string }) {
        this.roomName = player.gameId + player.gameName;
        this.playersQueue.push({
            socketId: socket.id,
            id: player.gameId,
            creatorName: player.creatorName,
            gameName: player.gameName,
            opponentName: player.opponentName,
        });
        const myPlayers: PlayerMulti[] = this.playersMatch();
        if (myPlayers.length === 2) {
            this.isMulti = true;
            this.gameName = player.gameName;
        }
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
        this.playerName = information.playerName;
        socket.to(information.roomName).emit('findDifference-return', { playerName: information.playerName });
    }

    @SubscribeMessage(ChatEvents.FeedbackDifference)
    async differenceFound(socket: Socket, data: [Array<number>, string]) {
        socket.to(data[1]).emit('feedbackDifference', data[0]);
    }

    @SubscribeMessage(ChatEvents.ModifyTime)
    async modifyTime(_: Socket, gameMode: string) {
        if (gameMode === 'tempsLimite') {
            this.serverTime.decrementTime(this.roomName);
        }
        else {
            const time =  this.serverTime.elapsedTimes.get(this.roomName);
            if (time) {
                this.serverTime.elapsedTimes.set(this.roomName, time + this.serverTime.timeConstants.timeBonus);
            }
        }
    }

    @SubscribeMessage(ChatEvents.MousePosition)
    async mouseDetect(socket: Socket, data: [position: number, roomName: string, mode: string]) {
        this.roomName = this.isMulti ? data[1] : socket.id;
        const diff = this.unfoundedDifference.get(this.roomName).find((set) => set.has(data[0]));
        if (!diff) {
            socket.emit('error');
            return;
        } else {
            if (data[2] === 'tempsLimite') {
                this.goToNextGame();
                this.serverTime.incrementTime();
            }
            socket.emit('diffFound', Array.from(diff));
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
        this.serverTime.removeTimer(roomName)
        this.isPlaying.set(roomName, false);
        this.isTimeLimit.set(this.roomName, false);
        socket.disconnect();
    }

    @SubscribeMessage(ChatEvents.SendGiveUp)
    async sendGiveUp(socket: Socket, information: { playerName: string; roomName: string }) {
        this.isPlaying.set(socket.id, false);
        socket.to(information.roomName).emit('giveup-return', { playerName: information.playerName });
    }

    @SubscribeMessage(ChatEvents.LeaveRoom)
    async leaveRoom(socket: Socket) {
        socket.to(this.roomName).socketsLeave(this.roomName);
        this.isPlaying.delete(socket.id);
        socket.disconnect();
    }

    @SubscribeMessage(ChatEvents.StopTimer)
    async stopTimer(socket: Socket, data: [string, string]) {
        socket.to(data[0]).emit('gameEnded', [true, data[1]]);
        this.isMulti = false;
        this.serverTime.stopChronometer(data[0]);
        this.serverTime.removeTimer(data[0]);
        socket.disconnect();
    }

    async handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id: ${socket.id} `);
        if (this.isMulti && this.isPlaying.get(this.roomName) && !this.isTimeLimit.get(this.roomName)) {
            socket.to(this.roomName).emit('giveup-return', { playerName: this.playerName });
        }
        if (this.isMulti && this.isPlaying.get(this.roomName) && this.isTimeLimit.get(this.roomName)) {
            socket.to(this.roomName).emit('teammateDisconnected', true);
        }
        socket.leave(this.roomName);
    }

    async handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id: ${socket.id} `);
    }

    afterInit() {
        this.emitTime();
    }

    defineDifferences(roomName: string, diffList: string[]): void {
        this.unfoundedDifference.set(roomName, this.gameService.getSetDifference(diffList));
    }

    private setGame(playerName?: string, gameName?: string): void { // from time to time i don't have the set of difference for the other player unless the other other find of difference need to fix that
        this.gameNames = this.gameService.gamesNames;
        this.games = this.gameService.getGames();
        this.game = this.games.get(this.chooseRandomName());
        this.unfoundedDifference.set(this.roomName, this.gameService.getSetDifference(this.game.listDifferences));
        this.isPlaying.set(this.roomName, true);
        this.isTimeLimit.set(this.roomName, true);
        this.playerName = playerName;
        this.gameName = gameName;
    }

    private emitTime(): void {
        setInterval(() => {
            if (this.serverTime.countDown === 0) {
                this.server.to(this.roomName).emit('timeLimitStatus', false);
                this.serverTime.removeTimer(this.roomName);
            }
            this.server.emit(ChatEvents.ServerTime, Array.from(this.serverTime.elapsedTimes));
        }, DELAY_BEFORE_EMITTING_TIME);
    }

    private playersMatch(): PlayerMulti[] {
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

    private removePlayerFromQueue(player: PlayerMulti): void {
        this.playersQueue = this.playersQueue.filter((p) => p.id !== player.id);
    }

    private chooseRandomName(): string {
        return this.gameNames[Math.floor(Math.random() * this.gameNames.length)];
    }

    private goToNextGame(): void {
        if (this.gameNames.length === 1) {
            this.server.to(this.roomName).emit('timeLimitStatus', true);
            return;
        }
        this.gameNames = this.gameNames.filter((name) => name !== this.game.gameName);
        this.game = this.games.get(this.chooseRandomName());
        this.server.to(this.roomName).emit('getRandomGame', this.game);
        this.server.to(this.roomName).emit('nbrDiffLeft', this.gameNames.length)
        this.unfoundedDifference.set(this.roomName, this.gameService.getSetDifference(this.game.listDifferences));
    }
}
