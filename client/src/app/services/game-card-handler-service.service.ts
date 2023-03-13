import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game-handler';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
// eslint-disable-next-line no-restricted-imports
import { MINUS_ONE, ONE } from '../configuration/const-game';

@Injectable({
    providedIn: 'root',
})
export class GameCardHandlerService {
    socket: Socket;
    allGames: string[];
    allGameStack: number[];
    constructor() {
        this.allGames = [];
        this.allGameStack = [];
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
        this.socket.on('feedbackOnJoin', (a) => {
            console.log(a);
        });
        this.socket.on('feedbackOnAccept', (a) => {
            console.log(a);
        });

        this.socket.on('feedbackOnWait', (a) => {
            console.log(a);
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
        this.socket.on('feedbackOnStart', (a) => {
            console.log(a);
        });
    }

    toggleCreateJoin(gameName: string): string {
        const index = this.allGames.indexOf(gameName);
        if (index === MINUS_ONE) return 'Créer';
        else if (this.allGameStack[index] === ONE) return 'Joindre';
        return 'Créer';
    }
}
