import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { MouseButton } from '@app/components/play-area/play-area.component';
import * as constants from '@app/configuration/const-canvas';
import * as constantsTime from '@app/configuration/const-time';
import { GameInformation } from '@app/interfaces/game-information';
import { ImagePath } from '@app/interfaces/hint-diff-path';
import { Message } from '@app/interfaces/message';
import { Vec2 } from '@app/interfaces/vec2';
import { GameDatabaseService } from '@app/services/game-database.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { Game, GameRecord, GamingHistory } from '@common/game';
import { Observable } from 'rxjs';
import { GameCardHandlerService } from './game-card-handler-service.service';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    path: ImagePath; // can be moved
    game: Game;
    gameInformation: GameInformation;
    totalDifferences: number;
    nDifferencesFound: number;
    differencesArray: string[];
    opponentDifferencesArray: string[];
    playerName: string;
    playersName: string[];
    gameTime: number;
    gameType: string;
    opponentName: string;
    gameId: string;
    gameName: string;
    diff: Set<number>;
    message: string;
    mousePosition: Vec2;
    errorPenalty: boolean;
    isWinner: boolean;
    startDate: string;
    hasAbandonedGame: boolean;

    // eslint-disable-next-line max-params
    constructor(
        private readonly gameCardHandlerService: GameCardHandlerService,
        public dialog: MatDialog,
        private gameDataBase: GameDatabaseService,
        private socket: SocketClientService,
    ) {
        this.path = {
            differenceNotFound: './assets/img/difference-not-found.png',
            differenceFound: './assets/img/difference-found.png',
        };
        this.gameInformation = {
            gameTitle: '',
            gameMode: '',
            gameDifficulty: '',
            nDifferences: 0,
        };
        this.nDifferencesFound = 0;
        this.mousePosition = { x: 0, y: 0 };
        this.errorPenalty = false;
        this.isWinner = false;
        this.startDate = '';
        this.hasAbandonedGame = false;
    }

    get width(): number {
        return constants.DEFAULT_WIDTH;
    }

    get height(): number {
        return constants.DEFAULT_HEIGHT;
    }

    defineVariables(): void {
        this.gameInformation = {
            gameTitle: this.game.gameName,
            gameMode: this.gameType,
            gameDifficulty: this.game.difficulty,
            nDifferences: this.game.listDifferences.length,
        };
        this.totalDifferences = this.gameInformation.nDifferences;
        this.differencesArray = new Array(this.totalDifferences);
        this.opponentDifferencesArray = new Array(this.totalDifferences);
        this.playersName = [this.playerName, this.opponentName];
    }

    getSetDifference(differencesStr: string[]): Set<number>[] {
        return differencesStr.map((a: string) => new Set(a.split(',').map((b: string) => Number(b))));
    }

    getGame(gameName: string): void {
        this.gameDataBase.getGameByName(gameName).subscribe((res: Game) => {
            this.game = res;
            this.defineVariables();
        });
    }

    initRewind(): void {
        // this.socket.gameTime = 0;
        this.totalDifferences = this.gameInformation.nDifferences;
        this.differencesArray = new Array(this.totalDifferences);
        this.displayIcons();
        this.opponentDifferencesArray = new Array(this.totalDifferences);
        this.socket.messageList = [];
        // this.playersName = [this.playerName, this.opponentName];
    }

    displayIcons(): void {
        // can be moved
        if (this.gameType === 'solo') {
            for (let i = 0; i < this.totalDifferences; i++) {
                this.differencesArray[i] = this.path.differenceNotFound;
            }
        }
        if (this.gameType === 'double') {
            for (let i = 0; i < this.totalDifferences; i++) {
                this.differencesArray[i] = this.path.differenceNotFound;
                this.opponentDifferencesArray[i] = this.path.differenceNotFound;
            }
        }
    }

    displayGameEnded(msg: string, type: string, time?: string) {
        // can be moved to a service
        this.dialog.open(MessageDialogComponent, {
            data: [msg, type, time],
            disableClose: true,
            minWidth: '250px',
            minHeight: '250px',
            panelClass: 'custom-dialog-container',
        });
    }

    setStartDate(date: string): void {
        this.startDate = date;
    }

    reinitializeGame(): void {
        this.totalDifferences = 0;
        this.differencesArray = [];
        this.opponentDifferencesArray = [];
        // this.playerName = '';
        // this.playersName = [];
        // this.opponentName = '';
        this.isWinner = false;
        this.startDate = '';
        this.hasAbandonedGame = false;
        this.gameId = '';
        // this.gameName = '';
        // this.gameTime = 0;
        // this.gameType = '';
        this.nDifferencesFound = 0;
        this.socket.messageList = [];
        // this.game = {
        //     gameName: '',
        //     difficulty: '',
        //     originalImageData: './assets/image_empty.bmp',
        //     modifiedImageData: './assets/image_empty.bmp',
        //     listDifferences: [],
        // };
        // this.gameInformation = {
        //     gameTitle: '',
        //     gameMode: '',
        //     gameDifficulty: '',
        //     nDifferences: 0,
        // };
    }

    reduceNbrDifferences(): void {
        this.nDifferencesFound++;
        this.differencesArray.pop();
        this.differencesArray.unshift(this.path.differenceFound);
    }
    handleDifferenceFound(): void {
        switch (this.gameType) {
            case 'solo':
                this.handleSoloDifference();
                break;
            case 'double':
                this.handleMultiDifference();
                break;
            default:
                break;
        }
    }

    handleMultiDifference(): void {
        this.socket.findDifference({ playerName: this.playerName, roomName: this.socket.getRoomName() });
        if (this.multiGameEnd() && this.gameType === 'double') {
            this.endGame();
        }
    }

    handleSoloDifference(): void {
        if (this.totalDifferenceReached()) {
            this.endGame();
        }
    }
    totalDifferenceReached(): boolean {
        return this.nDifferencesFound === this.totalDifferences;
    }

    handlePlayerDifference() {
        this.opponentDifferencesArray.pop();
        this.opponentDifferencesArray.unshift(this.path.differenceFound);
    }

    multiGameEnd(): boolean {
        // can be moved
        this.isWinner = true;
        if (this.totalDifferences % 2 === 0) {
            return this.nDifferencesFound === this.totalDifferences / 2;
        }
        // if this mean that this is the winner
        return this.nDifferencesFound === (this.totalDifferences + 1) / 2;
    }

    sendFoundMessage(): Message {
        this.message = new Date().toLocaleTimeString() + ' - ' + ' Différence trouvée';
        if (this.gameType === 'double') {
            this.message = this.message + ' par ' + this.playerName;
        }
        const foundMessage = {
            message: this.message,
            playerName: this.playerName,
            color: '#00FF00',
            pos: '50%',
            gameId: this.socket.getRoomName(),
            event: true,
        };
        this.socket.sendMessage(foundMessage);
        return {
            message: foundMessage.message,
            userName: foundMessage.playerName,
            mine: true,
            color: foundMessage.color,
            pos: foundMessage.pos,
            event: foundMessage.event,
        };
    }

    sendErrorMessage(): Message {
        this.message = new Date().toLocaleTimeString() + ' - ' + ' Erreur';
        if (this.gameType === 'double') {
            this.message = this.message + ' par ' + this.playerName;
        }
        const errorMessage = {
            message: this.message,
            playerName: this.playerName,
            color: '#FF0000',
            pos: '50%',
            gameId: this.socket.getRoomName(),
            event: true,
        };
        this.socket.sendMessage(errorMessage);

        return {
            message: errorMessage.message,
            userName: errorMessage.playerName,
            mine: true,
            color: errorMessage.color,
            pos: errorMessage.pos,
            event: errorMessage.event,
        };
    }

    endGame(): void {
        this.socket.stopTimer(this.socket.getRoomName(), this.playerName);
        this.socket.gameEnded(this.socket.getRoomName());
        this.gameTime = this.socket.getRoomTime(this.socket.getRoomName());
        this.saveGameRecord();
        this.displayGameEnded('Félicitation, vous avez terminée la partie', 'finished', this.getGameTime());
        this.reinitializeGame();
    }

    saveGameRecord(): void {
        // can be moved
        const gameRecord: GameRecord = {
            gameName: this.gameInformation.gameTitle,
            typeGame: this.gameType === 'double' ? 'multi' : 'solo',
            playerName: this.playerName,
            dateStart: new Date().getTime().toString(),
            time: this.getGameTime(),
        };
        const gamingHistory: GamingHistory = {
            gameName: this.gameInformation.gameTitle,
            dateStart: this.startDate,
            time: this.getGameTime(),
            gameType: this.gameType === 'double' ? 'multi' : 'solo',
            playerName: this.playerName,
            opponentName: this.gameType === 'double' ? this.opponentName : '999999999999999',
            hasAbandonedGame: this.hasAbandonedGame,
        };
        this.gameDataBase.createGameRecord(gameRecord).subscribe();
        if (this.gameType === 'solo' || this.isWinner) {
            this.gameDataBase.createGamingHistory(gamingHistory).subscribe();
        }
    }

    getGameTime(): string {
        // can be moved
        const minutes = Math.floor(this.gameTime / constantsTime.MIN_TO_SEC);
        const seconds = this.gameTime - minutes * constantsTime.MIN_TO_SEC;
        return `${minutes}:${seconds < constantsTime.UNIT ? '0' : ''}${seconds}`;
    }

    deleteGame(gameName: string): Observable<HttpResponse<string>> {
        // can be moved
        this.gameCardHandlerService.handleDelete(gameName);
        return this.gameDataBase.deleteGame(gameName);
    }

    mouseHitDetect(event: MouseEvent): void {
        if (event.button === MouseButton.Left && !this.errorPenalty) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            const distMousePosition: number = this.mousePosition.x + this.mousePosition.y * this.width;
            this.socket.sendMousePosition(distMousePosition);
        }
    }

    startPenaltyTimer(): void {
        this.errorPenalty = true;
        setTimeout(() => {
            this.errorPenalty = false;
        }, constantsTime.BLINKING_TIME);
    }

    displayGiveUp(msg: string, type: string): void {
        // can be moved
        this.dialog.open(MessageDialogComponent, {
            data: [msg, type],
            minWidth: '250px',
            minHeight: '150px',
            panelClass: 'custom-dialog-container',
        });
    }

    giveUp(): void {
        // can be moved
        this.hasAbandonedGame = true;
        this.saveGameRecord();
        this.reinitializeGame();
        this.displayGiveUp('Êtes-vous sûr de vouloir abandonner la partie? Cette action est irréversible.', 'giveUp');
    }
    deleteOneGameRecords(gameName: string): void {
        this.gameDataBase.deleteOneGameRecords(gameName).subscribe();
    }
}
