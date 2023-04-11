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
    isMulti: boolean = false;
    // create a queue of Players
    gameNames: string[];
    playersQueue: PlayerMulti[] = [];
    isPlaying: Map<string, boolean> = new Map<string, boolean>();
    unfoundedDifference: Map<string, Set<number>[]> = new Map<string, Set<number>[]>();
    games: Map<string, Game> = new Map<string, Game>();
    game: Game;
    isTimeLimit: boolean;
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
        this.isPlaying.set(socket.id, true);
        // const startTime = new Date();
        // const player: PlayerEntity = {
        //     playerName: data.playerName,
        //     socketId: socket.id,
        // };
        // if ((await this.playerService.getRoomIndex(socket.id)) === INDEX_NOT_FOUND) {
        socket.emit(ChatEvents.Hello, `${socket.id}`);
            // await this.playerService.addRoomSolo(socket.id, player, startTime);
        if (!this.serverTime.timers[socket.id]) {
            this.serverTime.startChronometer(socket.id);
        }
        socket.join(socket.id);
        // } else {
        //     this.logger.log('room already exists');
        // }
    }

    @SubscribeMessage(ChatEvents.StartTimeLimit)
    async startTimeLimit(socket: Socket, playerName: string) {
        this.roomName = socket.id;
        this.gameNames = this.gameService.gamesNames;
        this.games = this.gameService.getGames();
        this.game = this.games.get(this.chooseRandomName());
        this.unfoundedDifference.set(this.roomName, this.gameService.getSetDifference(this.game.listDifferences));
        this.isPlaying.set(this.roomName, true);
        this.isTimeLimit = true;
        this.playerName = playerName;
        socket.join(this.roomName);
        socket.emit(ChatEvents.Hello, `${socket.id}`);
        if (!this.serverTime.timers[this.roomName]) {
            this.serverTime.startCountDown(this.roomName);
        }
        this.server.to(this.roomName).emit('getRandomGame', this.game);
        this.server.to(this.roomName).emit('nbrDifference', this.games.size);
    }

    @SubscribeMessage(ChatEvents.SendRoomName)
    async sendRoomName(socket: Socket, data: [roomName: string, mode: string]) {
        this.logger.debug('sendRoomName');
        const game = this.gameService.getGame(this.gameName);
        this.roomName = data[0];
        if (!data[1]) this.unfoundedDifference.set(this.roomName, this.gameService.getSetDifference(game.listDifferences));
        this.isPlaying.set(this.roomName, true);
        socket.emit('sendRoomName', ['multi', this.roomName]);
        socket.join(this.roomName);
        this.logger.debug(this.unfoundedDifference.size);
        if (!this.serverTime.timers[this.roomName] && !data[1]) {
            this.logger.debug('start');
            this.serverTime.startChronometer(this.roomName);
        }
    }

    @SubscribeMessage(ChatEvents.StartMultiGame)
    async startMultiGame(socket: Socket, player: { gameId: string; creatorName: string; gameName: string; opponentName: string }) {
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
            // const player1: PlayerEntity = {
            //     playerName: myPlayers[0].creatorName,
            //     socketId: myPlayers[0].socketId,
            // };
            // const player2: PlayerEntity = {
            //     playerName: myPlayers[1].creatorName,
            //     socketId: myPlayers[1].socketId,
            // };
            // await this.playerService.addRoomMulti(this.roomName, [player1, player2], new Date());
            // console.log(this.playerService.rooms)
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
                this.serverTime.incrementTime();
                this.goToNextGame(); 
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
        this.serverTime.stopChronometer(roomName);
        this.isTimeLimit = false;
        await this.playerService.removeRoom(roomName);
        this.isPlaying.set(roomName, false);
        socket.to(roomName).socketsLeave(roomName);
    }
    @SubscribeMessage(ChatEvents.SendGiveUp)
    async sendGiveUp(socket: Socket, information: { playerName: string; roomName: string }) {
        // this.isPlaying = false;
        this.isPlaying.set(socket.id, false);
        // await this.playerService.removePlayer(information.roomName, information.playerName);
        socket.to(information.roomName).emit('giveup-return', { playerName: information.playerName });
    }

    @SubscribeMessage(ChatEvents.LeaveRoom)
    async leaveRoom(socket: Socket) {
        await this.playerService.removeRoom(this.roomName);
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
    }

    async handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id: ${socket.id} `);
        if(this.isMulti && this.isPlaying.get(this.roomName) ) { // need something else for time limit
            socket.to(this.roomName).emit('giveup-return', { playerName: this.playerName }); 
            // await this.playerService.removePlayer(this.roomName, this.playerName);
        }
        if (this.isMulti && this.isPlaying.get(this.roomName) && this.isTimeLimit){
            // send message to transform the view to solo Time Limit
        }
        socket.leave(this.roomName);
        // await this.playerService.removeRoom(this.roomName);
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

    private emitTime(): void {
        setInterval(() => {
            if (this.serverTime.countDown === 0) {
                this.logger.debug(this.roomName);
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
        if (this.gameNames.length !== 1) {
            this.gameNames = this.gameNames.filter((name) => name !== this.game.gameName);
            this.game = this.games.get(this.chooseRandomName());
            this.server.to(this.roomName).emit('getRandomGame', this.game);
            this.server.to(this.roomName).emit('nbrDiffLeft', this.gameNames.length)
            this.unfoundedDifference.set(this.roomName, this.gameService.getSetDifference(this.game.listDifferences));
        } else {
            this.server.to(this.roomName).emit('timeLimitStatus', true);
            this.serverTime.removeTimer(this.roomName);
        }
    }
}
