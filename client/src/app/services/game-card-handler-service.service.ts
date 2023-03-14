import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ONE } from '@app/configuration/const-game';
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
    games: Map<string, number>;
    constructor(private router: Router, private socketClientService: SocketClientService) {
        this.isCreator = false;
        this.isReadyToPlay = false;
        this.opponentPlayer = '';
        this.games = new Map<string, number>();
    }

    connect() {
        this.socket = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });
    }

    updateGameStatus(gameNames: string[]) {
        this.connect();
        this.socket.emit('findAllGamesStatus', gameNames);
        this.socket.on('updateStatus', (gamesStatus) => {
            this.games = new Map(gamesStatus);
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

        this.socket.on('feedbackOnStart', (gameIdentifier) => {
            // call method to redirect to game from service with gameIdentifier
            this.socketClientService.connect();
            this.socketClientService.startMultiGame(gameIdentifier);
            console.log(gameIdentifier);
            this.isReadyToPlay = true;
            this.redirect(gameIdentifier);
        });
        this.socket.on('feedbackOnLeave', (a) => {
            console.log(a);
        });

        this.socket.on('feedbackOnReject', (nextOpponentName) => {
            this.opponentPlayer = nextOpponentName;
            console.log(nextOpponentName);
        });
    }

    leave(gameName: string) {
        this.socket.emit('leaveGame', gameName);
    }

    startGame(gameName: string) {
        this.socket.emit('startGame', gameName);
    }

    rejectOpponent(gameName: string) {
        this.socket.emit('rejectOpponent', gameName);
    }

    toggleCreateJoin(gameName: string): string {
        if (this.games.has(gameName)) return this.games.get(gameName) === ONE ? 'Joindre' : 'Créer';
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
    }
}
