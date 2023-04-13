import { GameService } from '@app/services/game/game.service';
import { ServerTimeService } from '@app/services/time/server-time.service';
import { DELAY_BEFORE_EMITTING_TIME } from '@common/const-chat-gateway';
import { PlayerMulti } from '@common/player';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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
    playersQueue: PlayerMulti[] = [];
    gameNames: string[];
    games : Map<string, Game> = new Map<string, Game>();
    isPlaying : Map<string, boolean> = new Map<string, boolean>();
    unfoundedDifference : Map<string, Set<number>[]> = new Map<string, Set<number>[]>();
    game: Game;
    isTimeLimit: boolean;
    constructor(
        private readonly logger: Logger,
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
        this.roomName = socket.id
        const game = this.gameService.getGame(data.gameName);
        this.unfoundedDifference.set(socket.id, this.gameService.getSetDifference(game.listDifferences));
        this.isPlaying.set(socket.id, true);
        socket.emit(ChatEvents.Hello, `${socket.id}`);
        if (!this.serverTime.timers[socket.id]) {
            this.serverTime.startChronometer(socket.id);
            this.logger.debug('startchrono')
            this.logger.debug(socket.id)
        }
        socket.join(socket.id);
    }

    @SubscribeMessage(ChatEvents.StartTimeLimit)
    async startTimeLimit(socket: Socket, playerName: string) {
        this.logger.debug('time limit');
        this.roomName = socket.id;
        this.gameNames = this.gameService.gamesNames;
        this.games = this.gameService.getGames();
        this.game = this.games.get(this.chooseRandomName());
        this.unfoundedDifference.set(this.roomName, this.gameService.getSetDifference(this.game.listDifferences));
        this.isPlaying.set(this.roomName, true);
        this.isTimeLimit = true; // not sure
        this.playerName = playerName;
        socket.join(this.roomName);
        socket.emit(ChatEvents.Hello, `${socket.id}`);
        if (!this.serverTime.timers[this.roomName]) {
            this.serverTime.startCountDown(this.roomName);
        }
        this.server.to(this.roomName).emit('getRandomGame', this.game);
        this.server.to(this.roomName).emit('nbrDifference', this.games.size);
    }

    @SubscribeMessage(ChatEvents.StartMultiTimeLimit)
    async startMultiTimeLimit(socket: Socket, player: { gameId: string; creatorName: string; gameName: string; opponentName: string; mode: string}) {
        this.logger.debug('multiTimeLimit');
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
            this.isPlaying.set(this.roomName, true);
            // console.log(this.game);
            // socket.emit(ChatEvents.Hello, `${socket.id}`);
            // if (!this.serverTime.timers[this.roomName]) {
                //     this.serverTime.startCountDown(this.roomName);
                // }
                // this.server.to(this.roomName).emit('getRandomGame', this.game);
                // this.server.to(this.roomName).emit('nbrDifference', this.games.size);
            // this.unfoundedDifference.set(this.roomName, this.gameService.getSetDifference(this.game.listDifferences));
            // socket.join(this.roomName);
        }
        // this.playerName = player.creatorName;
    }



    @SubscribeMessage(ChatEvents.SendRoomName)
    async sendRoomName(socket: Socket, data: [roomName: string, mode: string]) {
        this.roomName = data[0];
        console.log(data)
        if (data[1]) {
            // this.game = this.games.get(this.chooseRandomName());
            this.gameNames = this.gameService.gamesNames;
            this.games = this.gameService.getGames();
            this.game = this.games.get(this.chooseRandomName());
            this.server.to(this.roomName).emit('getRandomGame', this.game);
            this.server.to(this.roomName).emit('nbrDifference', this.games.size);
            this.unfoundedDifference.set(this.roomName, this.gameService.getSetDifference(this.game.listDifferences));
            // console.log('the game', this.game)
            // this.server.to(this.roomName).emit('getRandomGame', this.game);
            // this.server.to(this.roomName).emit('nbrDifference', this.games.size);
            this.logger.debug('here')
            if (!this.serverTime.timers[this.roomName]) {
                this.serverTime.startCountDown(this.roomName);
            }
            // this.isTimeLimit = true; // not sure
        } else {
            const game = this.gameService.getGame(this.gameName);
            this.unfoundedDifference.set(this.roomName, this.gameService.getSetDifference(game.listDifferences));
            if (!this.serverTime.timers[this.roomName]) {
                this.serverTime.startChronometer(this.roomName);
            }
        }
        this.isPlaying.set(this.roomName, true);
        socket.emit('sendRoomName', ['multi', this.roomName]);
        socket.join(this.roomName);
        // const game = this.gameService.getGame(this.gameName);
        // this.roomName = data[0];
        // if (!data[1]) this.unfoundedDifference.set(this.roomName, this.gameService.getSetDifference(game.listDifferences));
        // this.isPlaying.set(this.roomName, true);
        // socket.emit('sendRoomName', ['multi', this.roomName]);
        // socket.join(this.roomName);
        // if (!this.serverTime.timers[this.roomName] && !data[1]) {
        //     this.serverTime.startChronometer(this.roomName);
        // }
    }

    @SubscribeMessage(ChatEvents.StartMultiGame)
    async startMultiGame(socket: Socket, player: { gameId: string; creatorName: string; gameName: string; opponentName: string; mode?:string }) {
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
        this.logger.debug('multi')
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
    async differenceFound(socket: Socket, data:[Array<number>,string]) {
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
                this.goToNextGame(); 
                this.serverTime.incrementTime();
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
        this.logger.debug('gameEnded')
        this.serverTime.stopChronometer(roomName);
        this.serverTime.removeTimer(roomName)
        this.isPlaying.set(roomName, false);
        this.isTimeLimit = false;
        // socket.to(roomName).socketsLeave(roomName);
        socket.disconnect();
    }
    @SubscribeMessage(ChatEvents.SendGiveUp)
    async sendGiveUp(socket: Socket, information: { playerName: string; roomName: string }) {
        this.isPlaying.set(socket.id, false);
        socket.to(information.roomName).emit('giveup-return', { playerName: information.playerName });
    }

    @SubscribeMessage(ChatEvents.LeaveRoom)
    async leaveRoom(socket: Socket) {
        this.logger.debug('leaveroom')
        socket.to(this.roomName).socketsLeave(this.roomName);
        this.isPlaying.delete(socket.id);
        socket.disconnect();
    }

    @SubscribeMessage(ChatEvents.StopTimer)
    async stopTimer(socket: Socket, data: [string, string]) {
        this.logger.debug('stoptimer')
        socket.to(data[0]).emit('gameEnded', [true, data[1]]);
        // this.isMulti = false;
        this.serverTime.stopChronometer(data[0]);
        this.serverTime.removeTimer(data[0]);
        socket.disconnect();
    }

    async handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id: ${socket.id} `);
        if(this.isMulti && this.isPlaying.get(this.roomName)) { // need something else for time limit
            socket.to(this.roomName).emit('giveup-return', { playerName: this.playerName }); 
        }
        if (this.isMulti && this.isPlaying.get(this.roomName) && this.isTimeLimit){
            socket.to(this.roomName).emit('teammateDisconnected', true);
            // send message to transform the view to solo Time Limit
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

    private emitTime(): void {
        setInterval(() => {
            if (this.serverTime.countDown === 0) {
                this.server.to(this.roomName).emit('timeLimitStatus', false);
                this.serverTime.removeTimer(this.roomName);
                this.logger.debug('went here1')
            }
            console.log(this.serverTime.elapsedTimes.get(this.roomName))
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

    private loadGame(): void {
        this.gameNames = this.gameService.gamesNames;
        this.games = this.gameService.getGames();
        this.game = this.games.get(this.chooseRandomName());
    }

    private goToNextGame(): void {
        if (this.gameNames.length === 1) {
            // this.serverTime.removeTimer(this.roomName);
            this.server.to(this.roomName).emit('timeLimitStatus', true);
            this.logger.debug('ici here1')
            return;
        }
        this.gameNames = this.gameNames.filter((name) => name !== this.game.gameName);
        this.game = this.games.get(this.chooseRandomName());
        this.server.to(this.roomName).emit('getRandomGame', this.game);
        this.server.to(this.roomName).emit('nbrDiffLeft', this.gameNames.length)
        this.unfoundedDifference.set(this.roomName, this.gameService.getSetDifference(this.game.listDifferences)); 
    }

    // private generateRandomRoomName(): string {
    //     return Math.random().toString(36).substring(2, 7);
    // }
}
