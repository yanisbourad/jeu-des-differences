import { ElementRef, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import * as constants from '@app/configuration/const-game';
import * as constantsTime from '@app/configuration/const-time';
import { GameInformation } from '@app/interfaces/game-information';
import { ImagePath } from '@app/interfaces/hint-diff-path';
import { GameDatabaseService } from '@app/services/game-database.service';
import { Game, GameRecord } from '@common/game';
import { ClientTimeService } from './client-time.service';
import { SocketClientService } from './socket-client.service';

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
    isGameFinished: boolean;
    nHintsUnused: number;
    nHintsUsed: number;
    hintsArray: string[];
    playerName: string;
    private renderer: Renderer2;

    constructor(
        rendererFactory: RendererFactory2,
        public dialog: MatDialog,
        private readonly clientTimeService: ClientTimeService,
        private gameDataBase: GameDatabaseService,
        private socket: SocketClientService,
    ) {
        this.path = {
            differenceNotFound: '../../../assets/img/difference-not-found.png',
            differenceFound: '../../../assets/img/difference-found.png',
            hintUnused: '../../../assets/img/hint-unused.png',
            hintUsed: '../../../assets/img/hint-used.png',
        };
        this.gameInformation = {
            gameTitle: '',
            gameMode: 'solo',
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
            gameMode: 'solo',
            gameDifficulty: this.game.difficulty,
            nDifferences: this.game.listDifferences.length,
            nHints: constants.NUMBER_OF_HINTS,
            hintsPenalty: constants.HINTS_PENALTY,
            isClassical: false,
        };
        this.nDifferencesNotFound = this.gameInformation.nDifferences;
        this.nHintsUnused = this.gameInformation.nHints;
        this.differencesArray = new Array(this.nDifferencesNotFound);
        this.hintsArray = new Array(this.nHintsUnused);
    }

    getGame(gameName: string): void {
        this.gameDataBase.getGameByName(gameName).subscribe((res: Game) => {
            this.game = res;
            this.defineVariables();
        });
    }

    displayIcons(): void {
        for (let i = 0; i < this.nDifferencesNotFound; i++) {
            this.differencesArray[i] = this.path.differenceNotFound;
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

    displayGameEnded(msg: string, type: string, time: string) {
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
        this.nDifferencesFound = 0;
        this.differencesArray = [];
        this.playerName = '';
        this.nDifferencesFound = 0;
        this.socket.leaveRoom();
        this.game = {
            gameName: '',
            difficulty: '',
            originalImageData: '',
            modifiedImageData: '',
            listDifferences: [],
        };
        this.gameInformation = {
            gameTitle: '',
            gameMode: 'solo',
            gameDifficulty: '',
            nDifferences: 0,
            nHints: constants.NUMBER_OF_HINTS,
            hintsPenalty: 0,
            isClassical: false,
        };
    }

    clickDifferencesFound(): void {
        if (this.nDifferencesFound < this.nDifferencesNotFound) {
            this.nDifferencesFound++;
            this.differencesArray.pop();
            this.differencesArray.unshift(this.path.differenceFound);
        }
        if (this.nDifferencesFound === this.nDifferencesNotFound) {
            this.clientTimeService.stopTimer();
            this.isGameFinished = true;
            this.saveGameRecord();
            this.displayGameEnded('Félicitation, vous avez terminée la partie', 'finished', this.getGameTime());
            // Hard reset variables
            this.reinitializeGame();
        }
    }

    saveGameRecord(): void {
        const gameRecord: GameRecord = {
            gameName: this.gameInformation.gameTitle,
            typeGame: this.gameInformation.gameMode,
            playerName: this.playerName,
            dateStart: new Date().getTime().toString(),
            time: this.getGameTime(),
        };
        this.gameDataBase.createGameRecord(gameRecord).subscribe();
    }

    getGameTime(): string {
        const minutes = Math.floor(this.clientTimeService.getCount() / constantsTime.SIXTY_SECOND);
        const seconds = this.clientTimeService.getCount() - minutes * constantsTime.SIXTY_SECOND;
        return `${minutes}:${seconds < constantsTime.UNDER_TEN ? '0' : ''}${seconds}`;
    }

    playSuccessAudio(): void {
        const audio = new Audio();
        audio.src = '../../assets/sounds/yay-6120.mp3';
        audio.load();
        audio.play();
    }

    playFailureAudio(): void {
        const audio = new Audio();
        audio.src = '../../assets/sounds/wronganswer-37702.mp3';
        audio.load();
        audio.play();
    }
}
