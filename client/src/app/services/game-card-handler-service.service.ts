import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ONE, TWO } from '@app/configuration/const-game';
import { Game, GamersInfo } from '@app/interfaces/game-handler';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { SocketClientService } from './socket-client.service';
// eslint-disable-next-line no-restricted-imports

@Injectable({
    providedIn: 'root',
})
export class GameCardHandlerService {
    socket: Socket;
    isCreator: boolean;
    state: string;
    opponentPlayer: string;
    isReadyToPlay: boolean;
    isNewUpdate: boolean;
    isLeaving: boolean;
    isRejected: boolean;
    isCreatorLeft: boolean;
    games: Map<string, number>;
    constructor(private router: Router, private socketClientService: SocketClientService) {
        this.isCreator = false;
        this.state = '';
        this.isReadyToPlay = false;
        this.opponentPlayer = '';
        this.games = new Map<string, number>();
        this.isNewUpdate = false;
        this.isLeaving = false;
        this.isRejected = false;
        this.isCreatorLeft = false;
    }

    getGameState(): string {
        return this.state;
    }

    getCreatorStatus(): boolean {
        return this.isCreator;
    }

    getReadinessStatus(): boolean {
        return this.isReadyToPlay;
    }

    setReadinessStatus(status: boolean) {
        this.isReadyToPlay = status;
    }

    getCancelingState(): boolean {
        return this.isCreatorLeft;
    }

    getRejectionStatus(): boolean {
        return this.isRejected;
    }

    connect() {
        this.socket = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });
    }

    updateGameStatus(gameNames: string[]) {
        this.connect();
        this.socket.emit('findAllGamesStatus', gameNames);
        this.socket.on('updateStatus', (gamesStatus) => {
            this.games = new Map(gamesStatus);
            this.isNewUpdate = true;
        });
    }

    getNewUpdate() {
        return this.isNewUpdate;
    }

    setNewUpdate(isNewUpdate: boolean) {
        this.isNewUpdate = isNewUpdate;
    }

    listenToFeedBack() {
        this.socket.on('feedbackOnJoin', () => {
            this.isCreator = true;
            this.opponentPlayer = "Attente d'un adversaire";
        });
        this.socket.on('feedbackOnAccept', (name) => {
            this.opponentPlayer = name;
            if (this.isCreator) this.state = 'Accepter';
        });

        this.socket.on('feedbackOnWait', (name) => {
            this.opponentPlayer = name;
        });

        this.socket.on('feedbackOnWaitLonger', (name) => {
            this.opponentPlayer = name;
        });

        this.socket.on('feedbackOnStart', (gameIdentifier) => {
            // call method to redirect to game from service with gameIdentifier
            console.log(gameIdentifier);
            this.socketClientService.connect();
            this.socketClientService.startMultiGame(gameIdentifier);
            this.isReadyToPlay = true;
            this.redirect(gameIdentifier);
            this.resetGameVariables();
        });

        this.socket.on('feedBackOnLeave', () => {
            // send pop up to player
            this.isCreatorLeft = true;
            this.isLeaving = true;
        });

        this.socket.on('feedbackOnReject', () => {
            this.isRejected = true;
            this.isLeaving = true;
        });

        this.socket.on('byeTillNext', () => {
            this.isCreatorLeft = true;
            this.isLeaving = true;
        });
        this.socket.on('updateStatus', (gamesStatus) => {
            this.games = new Map(gamesStatus);
            this.isNewUpdate = true;
        });

        this.socket.on('disconnect', () => {
            this.isLeaving = true;
            this.resetGameVariables();
        });
    }

    join(game: Game) {
        this.socket.emit('joinGame', game);
        this.isLeaving = false;
        this.isReadyToPlay = false;
        this.listenToFeedBack();
    }

    resetGameVariables(): void {
        this.isCreator = false;
        this.state = '';
        this.opponentPlayer = '';
        this.isRejected = false;
        this.isLeaving = false;
    }

    handleDelete(gameName: string) {
        this.socket.emit('handleDelete', gameName);
        console.log('yeahhhhhhhhhhhhhhhhhhhhhhh');
        this.listenToFeedBack();
    }
    getLeavingState(): boolean {
        return this.isLeaving;
    }

    leave(gameName: string): void {
        this.socket.emit('cancelGame', gameName);
        this.listenToFeedBack();
    }

    startGame(gameName: string): void {
        this.socket.emit('startGame', gameName);
    }

    rejectOpponent(gameName: string): void {
        this.socket.emit('rejectOpponent', gameName);
        this.listenToFeedBack();
    }

    toggleCreateJoin(gameName: string): string {
        if (this.games.has(gameName)) return this.games.get(gameName) === ONE || this.games.get(gameName) === TWO ? 'Joindre' : 'Créer';
        return 'Créer';
    }

    redirect(gamersIdentifier: GamersInfo): void {
        this.router.navigate([
            '/game',
            {
                player: this.isCreator ? gamersIdentifier.creatorName : gamersIdentifier.opponentName,
                opponentName: this.isCreator ? gamersIdentifier.opponentName : gamersIdentifier.creatorName,
                gameName: gamersIdentifier.gameName,
                gameType: 'double',
                gameId: gamersIdentifier.gameId,
            },
        ]);
        this.socket.disconnect();
    }
}
