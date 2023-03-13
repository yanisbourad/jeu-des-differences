import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game-handler';
import { io, Socket } from 'socket.io-client';
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
    allGames: string[];
    allGameStack: number[];
    constructor() {
        this.allGames = [];
        this.allGameStack = [];
        this.isCreator = false;
        this.opponentPlayer = '';
    }

    connect() {
        this.socket = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });
    }

    updateGameStatus(gameNames: string[]) {
        this.connect();
        this.socket.emit('findAllGamesStatus', gameNames);
        this.socket.on('found', ({ games, stacks }) => {
            this.allGames = games;
            this.allGameStack = stacks;
        });
    }

    join(game: Game) {
        this.socket.emit('joinGame', game);
        this.socket.on('feedbackOnJoin', () => {
            this.isCreator = true;
            this.opponentPlayer = "Attente d'un adversaire";
        });
        this.socket.on('feedbackOnAccept', (name) => {
            this.opponentPlayer = name;
            if (this.isCreator) this.state = 'Accept';
        });

        this.socket.on('feedbackOnWait', (name) => {
            this.opponentPlayer = name;
        });

        this.socket.on('feedbackOnWaitLonger', (name) => {
            this.opponentPlayer = name;
        });
    }

    leave(gameName: string) {
        this.socket.emit('leaveGame', gameName);
        this.socket.on('feedbackOnLeave', (a) => {
            console.log(a);
        });
    }

    startGame(gameName: string) {
        this.socket.emit('startGame', gameName);
        this.socket.on('feedbackOnStart', (gameIdentifier) => {
            // call method to redirect to game from service with gameIdentifier
            console.log(gameIdentifier);
        });
    }

    rejectOpponent(gameName: string) {
        this.socket.emit('rejectOpponent', gameName);
        this.socket.on('feedbackOnReject', (nextOpponentName) => {
            this.opponentPlayer = nextOpponentName;
            console.log(nextOpponentName);
        });
    }

    toggleCreateJoin(gameName: string): string {
        // const index = this.allGames.indexOf(gameName);
        // if (index === MINUS_ONE) return 'Créer';
        // else if (this.allGameStack[index] === ONE) return 'Joindre';
        return 'Créer';
    }
}
