import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ONE, TWO } from '@app/configuration/const-game';
import { Game, GamersInfo } from '@app/interfaces/game-handler';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
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
    games: Map<string, number>;
    constructor(private router: Router) {
        this.isCreator = false;
        this.state = '';
        this.isReadyToPlay = false;
        this.opponentPlayer = '';
        this.games = new Map<string, number>();
        this.isNewUpdate = false;
        this.isLeaving = false;
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

    join(game: Game) {
        this.socket.emit('joinGame', game);
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
            this.isReadyToPlay = true;
            this.redirect(gameIdentifier);
        });
        this.socket.on('feedbackOnLeave', () => {
            this.resetGameVariables();
        });

        this.socket.on('feedbackOnReject', () => {
            // this.opponentPlayer = nextOpponentName;
            // console.log(nextOpponentName);
        });

        this.socket.on('byeTillNext', () => {
            this.isLeaving = true;
            this.resetGameVariables();
        });
    }

    resetGameVariables(): void {
        this.isCreator = false;
        this.state = '';
        this.isReadyToPlay = false;
        this.opponentPlayer = '';
    }

    getLeavingState(): boolean {
        return this.isLeaving;
    }

    leave(gameName: string): void {
        this.socket.emit('leaveGame', gameName);
    }

    startGame(gameName: string): void {
        this.socket.emit('startGame', gameName);
    }

    rejectOpponent(gameName: string): void {
        this.socket.emit('rejectOpponent', gameName);
    }

    toggleCreateJoin(gameName: string): string {
        if (this.games.has(gameName)) return this.games.get(gameName) === ONE || this.games.get(gameName) === TWO ? 'Joindre' : 'Créer';
        return 'Créer';
    }

    redirect(gamersIdentifier: GamersInfo): void {
        this.router.navigate([
            '/game',
            {
                player: gamersIdentifier.name,
                opponentName: gamersIdentifier.opponentName,
                gameName: gamersIdentifier.gameName,
            },
        ]);
    }
}
