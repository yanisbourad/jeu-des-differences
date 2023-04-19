import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Game, GameIdentifier, GamersInfo } from '@app/interfaces/game-handler';
import { SocketClientService } from '@app/services/socket/socket-client.service';
import { SocketClient } from '@app/utils/socket-client';
import { Socket } from 'socket.io-client';
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
    isGameAvailable: boolean;
    gameName: string;
    games: Map<string, number>;
    constructor(private router: Router, private socketClientService: SocketClientService, private socketClient: SocketClient) {
        this.isCreator = false;
        this.state = '';
        this.isReadyToPlay = false;
        this.opponentPlayer = '';
        this.games = new Map<string, number>();
        this.isNewUpdate = false;
        this.isLeaving = false;
        this.isRejected = false;
        this.isCreatorLeft = false;
        this.isGameAvailable = true;
        this.gameName = '';
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
    getGameAvailability(): boolean {
        return this.isGameAvailable;
    }

    connect() {
        this.socketClient.connect();
        this.socket = this.socketClient.socket;
    }

    updateGameStatus(gameNames: string[]) {
        this.connect();
        this.socketClient.send('findAllGamesStatus', gameNames);
        this.listenToFeedBack();
    }

    getNewUpdate() {
        return this.isNewUpdate;
    }

    setNewUpdate(isNewUpdate: boolean) {
        this.isNewUpdate = isNewUpdate;
    }

    startSpecificGame(gameIdentifier: GameIdentifier): void {
        if (gameIdentifier.gameName === 'limitedTime99999') {
            this.socketClientService.startMultiTimeLimit(gameIdentifier);
            this.gameName = gameIdentifier.gameName as string;
        } else {
            this.socketClientService.startMultiGame(gameIdentifier);
        }
        this.isReadyToPlay = true;
        this.redirect(gameIdentifier);
    }

    runAction(event: string, object: unknown): void {
        switch (event) {
            case 'gameUnavailable':
                this.isGameAvailable = false;
                break;
            case 'feedbackOnJoin':
                this.isCreator = true;
                this.opponentPlayer = object as string;
                break;
            case 'feedbackOnAccept':
                this.opponentPlayer = object as string;
                if (this.isCreator) this.state = 'Accepter';
                break;
            case 'feedbackOnWait':
                this.opponentPlayer = object as string;
                break;
            case 'feedbackOnWaitLonger':
                this.opponentPlayer = object as string;
                break;
            case 'feedbackOnStart':
                this.startSpecificGame(object as GameIdentifier);
                break;
            case 'feedBackOnLeave':
                this.isCreatorLeft = true;
                this.isLeaving = true;
                break;
            case 'feedbackOnReject':
                this.isRejected = true;
                this.isLeaving = true;
                break;
            case 'disconnect':
                this.isLeaving = true;
                break;
            default:
                break;
        }
    }

    listenToFeedBack() {
        this.socket.on('updateStatus', (gamesStatus) => {
            this.games = new Map(gamesStatus);
            this.isNewUpdate = true;
        });
        this.socket.on('globalEvent', (response) => {
            this.runAction(response.event, response.object);
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
        this.isGameAvailable = true;
        this.gameName = '';
    }

    handleDelete(gameName: string) {
        this.socket.emit('handleDelete', gameName);
        this.listenToFeedBack();
    }
    getLeavingState(): boolean {
        return this.isLeaving;
    }

    leave(gameName: string): void {
        this.socket.emit('cancelGame', gameName);
        this.isCreator = false;
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
        if (this.games.has(gameName)) return this.games.get(gameName) === 1 || this.games.get(gameName) === 2 ? 'Joindre' : 'Créer';
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
                mode: gamersIdentifier.mode,
            },
        ]);
        // used later on to handle the disconnection of a player
        this.socketClientService.isPlaying = true;
    }

    redirectToHomePage(): void {
        this.router.navigate(['/home']);
    }
}
