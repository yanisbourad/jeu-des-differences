import { HttpResponse } from '@angular/common/http';
import { ElementRef, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import * as constants from '@app/configuration/const-canvas';
import * as constantsTime from '@app/configuration/const-time';
import { GameInformation } from '@app/interfaces/game-information';
import { ImagePath } from '@app/interfaces/hint-diff-path';
import { GameDatabaseService } from '@app/services/game-database.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { Game, GameRecord, GamingHistory } from '@common/game';
import { Observable } from 'rxjs';
import { GameCardHandlerService } from './game-card-handler-service.service';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    path: ImagePath;
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
    message: string;
    isWinner: boolean;
    private renderer: Renderer2;

    // eslint-disable-next-line max-params
    constructor(
        rendererFactory: RendererFactory2,
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
        this.renderer = rendererFactory.createRenderer(null, null);
        this.isWinner = false;
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

    getGame(gameName: string): void {
        this.gameDataBase.getGameByName(gameName).subscribe((res: Game) => {
            this.game = res;
            this.defineVariables();
        });
    }

    displayIcons(): void {
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

    async blinkDifference(canvas1: ElementRef<HTMLCanvasElement>, canvas2: ElementRef<HTMLCanvasElement>): Promise<void> {
        let isVisible = true;
        let blinkCount = 0;
        const intervalId = setInterval(() => {
            isVisible = !isVisible;
            if (this.renderer) {
                this.renderer.setStyle(canvas1.nativeElement, 'visibility', isVisible ? 'visible' : 'hidden');
                this.renderer.setStyle(canvas2.nativeElement, 'visibility', isVisible ? 'visible' : 'hidden');
            }
            blinkCount++;
            if (blinkCount === constantsTime.BLINKING_COUNT) {
                clearInterval(intervalId);
            }
        }, constantsTime.BLINKING_TIMEOUT);
    }

    displayGameEnded(msg: string, type: string, time?: string) {
        this.dialog.open(MessageDialogComponent, {
            data: [msg, type, time],
            disableClose: true,
            minWidth: '250px',
            minHeight: '250px',
            panelClass: 'custom-dialog-container',
        });
    }

    reinitializeGame(): void {
        this.totalDifferences = 0;
        this.differencesArray = [];
        this.opponentDifferencesArray = [];
        this.playerName = '';
        this.playersName = [];
        this.opponentName = '';
        this.isWinner = false;
        this.gameId = '';
        this.gameName = '';
        this.gameTime = 0;
        this.gameType = '';
        this.nDifferencesFound = 0;
        this.socket.messageList = [];
        this.game = {
            gameName: '',
            difficulty: '',
            originalImageData: './assets/image_empty.bmp',
            modifiedImageData: './assets/image_empty.bmp',
            listDifferences: [],
        };
        this.gameInformation = {
            gameTitle: '',
            gameMode: '',
            gameDifficulty: '',
            nDifferences: 0,
        };
    }

    handleDifferenceFound(): void {
        this.nDifferencesFound++;
        this.differencesArray.pop();
        this.differencesArray.unshift(this.path.differenceFound);

        if (this.gameType === 'double') {
            this.socket.findDifference({ playerName: this.playerName, roomName: this.socket.getRoomName() });
        }

        if (this.totalDifferenceReached() && this.gameType === 'solo') {
            this.endGame();
        }

        if (this.multiGameEnd() && this.gameType === 'double') {
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
        if (this.totalDifferences % 2 === 0) {
            return this.nDifferencesFound === this.totalDifferences / 2;
        }
        // if this mean that this is the winner
        this.isWinner = true;
        return this.nDifferencesFound === (this.totalDifferences + 1) / 2;
    }

    sendFoundMessage(): void {
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
        this.socket.messageList.push({
            message: foundMessage.message,
            userName: foundMessage.playerName,
            mine: true,
            color: foundMessage.color,
            pos: foundMessage.pos,
            event: foundMessage.event,
        });
    }

    sendErrorMessage(): void {
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
        this.socket.messageList.push({
            message: errorMessage.message,
            userName: errorMessage.playerName,
            mine: true,
            color: errorMessage.color,
            pos: errorMessage.pos,
            event: errorMessage.event,
        });
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
        const gameRecord: GameRecord = {
            gameName: this.gameInformation.gameTitle,
            typeGame: this.gameType === 'double' ? 'multi' : 'solo',
            playerName: this.playerName,
            dateStart: new Date().getTime().toString(),
            time: this.getGameTime(),
        };
        const gamingHistory: GamingHistory = {
            gameName: this.gameInformation.gameTitle,
            dateStart: new Date().toString(),
            time: this.getGameTime(),
            gameType: this.gameType === 'double' ? 'multi' : 'solo',
            playerName: this.playerName,
            opponentName: this.gameType === 'double' ? this.opponentName : '999999999999999',
        };
        this.gameDataBase.createGameRecord(gameRecord).subscribe();
        if (this.gameType === 'solo' || this.isWinner) {
            this.gameDataBase.createGamingHistory(gamingHistory).subscribe();
        }
    }

    getGameTime(): string {
        const minutes = Math.floor(this.gameTime / constantsTime.MIN_TO_SEC);
        const seconds = this.gameTime - minutes * constantsTime.MIN_TO_SEC;
        return `${minutes}:${seconds < constantsTime.UNIT ? '0' : ''}${seconds}`;
    }

    playSuccessAudio(): void {
        const audio = new Audio();
        audio.src = './assets/sounds/yay-6120.mp3';
        audio.load();
        audio.play();
    }

    playFailureAudio(): void {
        const audio = new Audio();
        audio.src = './assets/sounds/wronganswer-37702.mp3';
        audio.load();
        audio.play();
    }

    deleteGame(gameName: string): Observable<HttpResponse<string>> {
        this.gameCardHandlerService.handleDelete(gameName);
        return this.gameDataBase.deleteGame(gameName);
    }
}
