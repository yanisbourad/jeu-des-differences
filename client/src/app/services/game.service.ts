import { HttpResponse } from '@angular/common/http';
import { ElementRef, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
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
import { Game, GameRecord } from '@common/game';
import { Observable } from 'rxjs';
import { DrawService } from './draw.service';
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
    diff: Set<number>;
    message: string;
    mousePosition: Vec2;
    errorPenalty: boolean;
    private renderer: Renderer2;

    // eslint-disable-next-line max-params
    constructor(
        rendererFactory: RendererFactory2,
        private readonly gameCardHandlerService: GameCardHandlerService,
        public dialog: MatDialog,
        private gameDataBase: GameDatabaseService,
        private socket: SocketClientService,
        private readonly drawService: DrawService,
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
        this.mousePosition = { x: 0, y: 0 };
        this.errorPenalty = false;
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
        this.socket.gameTime = 0;
        this.totalDifferences = this.gameInformation.nDifferences;
        this.differencesArray = new Array(this.totalDifferences);
        this.opponentDifferencesArray = new Array(this.totalDifferences);
        this.playersName = [this.playerName, this.opponentName];
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
        // this.playerName = '';
        // this.playersName = [];
        // this.opponentName = '';
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

    // if (this.gameType === 'double') {
    //     this.socket.findDifference({ playerName: this.playerName, roomName: this.socket.getRoomName() });
    // }

    // if (this.totalDifferenceReached() && this.gameType === 'solo') {
    //     this.endGame();
    // }

    // if (this.multiGameEnd() && this.gameType === 'double') {
    //     this.endGame();
    // }
    // }
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
        if (this.totalDifferences % 2 === 0) {
            return this.nDifferencesFound === this.totalDifferences / 2;
        }
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
        // new GameMessageEvent(this.gameTime, {
        //     message: foundMessage.message,
        //     userName: foundMessage.playerName,
        //     mine: true,
        //     color: foundMessage.color,
        //     pos: foundMessage.pos,
        //     event: foundMessage.event,
        // }).record(this.gameRecorderService);
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
        // new GameMessageEvent(this.gameTime, {
        //     message: errorMessage.message,
        //     userName: errorMessage.playerName,
        //     mine: true,
        //     color: errorMessage.color,
        //     pos: errorMessage.pos,
        //     event: errorMessage.event,
        // }).record(this.gameRecorderService);
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
        this.gameDataBase.createGameRecord(gameRecord).subscribe();
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

    mouseHitDetect(event: MouseEvent): void {
        if (event.button === MouseButton.Left && !this.errorPenalty) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            const distMousePosition: number = this.mousePosition.x + this.mousePosition.y * this.width;
            this.socket.sendMousePosition(distMousePosition);
        }
    }

    diffFound(
        canvas: {
            canvas0: ElementRef<HTMLCanvasElement>;
            canvas1: ElementRef<HTMLCanvasElement>;
            canvas2: ElementRef<HTMLCanvasElement>;
            canvas3: ElementRef<HTMLCanvasElement>;
        },
        diff: Set<number>,
    ): void {
        this.displayWord('Trouvé', canvas);
        this.drawDifference(diff, false, canvas);
        // to change
        this.socket.sendDifference(diff, this.socket.getRoomName());
        this.sendFoundMessage();
        this.handleDifferenceFound();
        this.clearCanvas(canvas.canvas0.nativeElement, canvas.canvas3.nativeElement);
    }

    diffNotFound(canvas: {
        canvas0: ElementRef<HTMLCanvasElement>;
        canvas1: ElementRef<HTMLCanvasElement>;
        canvas2: ElementRef<HTMLCanvasElement>;
        canvas3: ElementRef<HTMLCanvasElement>;
    }): void {
        this.errorPenalty = true;
        this.displayWord('Erreur', canvas);
        this.sendErrorMessage();
        this.clearCanvas(canvas.canvas0.nativeElement, canvas.canvas3.nativeElement);
    }

    clearCanvas(canvasA: HTMLCanvasElement, canvasB: HTMLCanvasElement): void {
        setTimeout(() => {
            this.drawService.clearDiff(canvasA);
            this.drawService.clearDiff(canvasB);
        }, constantsTime.BLINKING_TIME);
    }

    displayWord(
        word: string,
        canvas: {
            canvas0: ElementRef<HTMLCanvasElement>;
            canvas1: ElementRef<HTMLCanvasElement>;
            canvas2: ElementRef<HTMLCanvasElement>;
            canvas3: ElementRef<HTMLCanvasElement>;
        },
    ): void {
        this.drawService.drawWord(word, canvas.canvas0.nativeElement, this.mousePosition);
        this.drawService.drawWord(word, canvas.canvas3.nativeElement, this.mousePosition);
        if (word === 'Erreur') {
            this.playFailureAudio();
            setTimeout(() => {
                this.errorPenalty = false;
            }, constantsTime.BLINKING_TIME);
        } else {
            this.playSuccessAudio();
            this.blinkDifference(canvas.canvas1, canvas.canvas2);
        }
    }

    drawDifference(
        diff: Set<number>,
        isCheating: boolean = false,
        canvas: {
            canvas0: ElementRef<HTMLCanvasElement>;
            canvas1: ElementRef<HTMLCanvasElement>;
            canvas2: ElementRef<HTMLCanvasElement>;
            canvas3: ElementRef<HTMLCanvasElement>;
        },
    ): void {
        if (!isCheating) {
            this.drawService.drawDiff(diff, canvas.canvas0.nativeElement);
            this.drawService.drawDiff(diff, canvas.canvas1.nativeElement);
        } else {
            this.drawService.drawDiff(diff, canvas.canvas2.nativeElement);
            this.drawService.drawDiff(diff, canvas.canvas3.nativeElement);
        }
    }
}
