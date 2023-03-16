import { HttpResponse } from '@angular/common/http';
import { ElementRef, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import * as constants from '@app/configuration/const-game';
import * as constantsTime from '@app/configuration/const-time';
import { GameInformation } from '@app/interfaces/game-information';
import { ImagePath } from '@app/interfaces/hint-diff-path';
import { GameDatabaseService } from '@app/services/game-database.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { Game, GameRecord } from '@common/game';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    path: ImagePath;
    game: Game;
    gameInformation: GameInformation;
    nDifferencesNotFound: number;
    nDifferencesFound: number;
    differencesArray: string[];
    opponentDifferencesArray: string[];
    isGameFinished: boolean;
    nHintsUnused: number;
    nHintsUsed: number;
    hintsArray: string[];
    playerName: string;
    playersName: string[];
    gameTime: number;
    gameType: string;
    opponentName: string;
    gameId: string;
    gameName: string;
    private renderer: Renderer2;

    // eslint-disable-next-line max-params
    constructor(
        rendererFactory: RendererFactory2,
        public dialog: MatDialog,
        private gameDataBase: GameDatabaseService,
        private socket: SocketClientService,
    ) {
        this.path = {
            differenceNotFound: './assets/img/difference-not-found.png',
            differenceFound: './assets/img/difference-found.png',
            hintUnused: './assets/img/hint-unused.png',
            hintUsed: './assets/img/hint-used.png',
        };
        this.gameInformation = {
            gameTitle: '',
            gameMode: '',
            gameDifficulty: '',
            nDifferences: 0,
            nHints: constants.NUMBER_OF_HINTS,
            hintsPenalty: 0,
            isClassical: false,
        };
        this.nDifferencesFound = 0;
        this.isGameFinished = false;
        this.renderer = rendererFactory.createRenderer(null, null);
    }

    defineVariables(): void {
        this.gameInformation = {
            gameTitle: this.game.gameName,
            gameMode: this.gameType,
            gameDifficulty: this.game.difficulty,
            nDifferences: this.game.listDifferences.length,
            nHints: constants.NUMBER_OF_HINTS,
            hintsPenalty: constants.HINTS_PENALTY,
            isClassical: false,
        };
        this.nDifferencesNotFound = this.gameInformation.nDifferences;
        this.nHintsUnused = this.gameInformation.nHints;
        this.differencesArray = new Array(this.nDifferencesNotFound);
        this.opponentDifferencesArray = new Array(this.nDifferencesNotFound);
        this.hintsArray = new Array(this.nHintsUnused);
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
            for (let i = 0; i < this.nDifferencesNotFound; i++) {
                this.differencesArray[i] = this.path.differenceNotFound;
            }
        }
        if (this.gameType === 'double') {
            for (let i = 0; i < this.nDifferencesNotFound; i++) {
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
        this.nDifferencesNotFound = 0;
        this.nHintsUnused = 0;
        this.differencesArray = [];
        this.playerName = '';
        this.playersName = [];
        this.opponentName = '';
        this.isGameFinished = false;
        this.gameId = '';
        this.gameName = '';
        this.gameTime = 0;
        this.gameType = '';
        this.nDifferencesFound = 0;
        this.socket.messageList = [];
        this.game = {
            gameName: '',
            difficulty: '',
            originalImageData: '../../assets/image_empty.bmp',
            modifiedImageData: '../../assets/image_empty.bmp',
            listDifferences: [],
        };
        this.gameInformation = {
            gameTitle: '',
            gameMode: '',
            gameDifficulty: '',
            nDifferences: 0,
            nHints: constants.NUMBER_OF_HINTS,
            hintsPenalty: 0,
            isClassical: false,
        };
    }

    handleDifferenceFound(): void {
        this.nDifferencesFound++;
        this.differencesArray.pop();
        this.differencesArray.unshift(this.path.differenceFound);

        if (this.gameType === 'double') {
            this.socket.findDifference({ playerName: this.playerName, roomName: this.socket.getRoomName() });
        }

        if (this.nDifferencesFound === this.nDifferencesNotFound && this.gameType === 'solo') {
            this.endGame();
        }

        if (this.multiGameEnd() && this.gameType === 'double') {
            this.endGame();
        }
    }

    handlePlayerDifference() {
        this.opponentDifferencesArray.pop();
        this.opponentDifferencesArray.unshift(this.path.differenceFound);
    }

    multiGameEnd(): boolean {
        if (this.nDifferencesNotFound % 2 === 0) {
            return this.nDifferencesFound === this.nDifferencesNotFound / 2;
        }
        return this.nDifferencesFound === (this.nDifferencesNotFound + 1) / 2;
    }

    endGame(): void {
        this.socket.stopTimer(this.socket.getRoomName(), this.playerName);
        this.socket.gameEnded(this.socket.getRoomName());
        this.gameTime = this.socket.getRoomTime(this.socket.getRoomName());
        this.isGameFinished = true;
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
        this.gameDataBase.createGameRecord(gameRecord).subscribe();
    }

    getGameTime(): string {
        const minutes = Math.floor(this.gameTime / constantsTime.SIXTY_SECOND);
        const seconds = this.gameTime - minutes * constantsTime.SIXTY_SECOND;
        return `${minutes}:${seconds < constantsTime.UNDER_TEN ? '0' : ''}${seconds}`;
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
        return this.gameDataBase.deleteGame(gameName);
    }
}
