import { HttpResponse } from '@angular/common/http';
import { ElementRef, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import * as constantsTime from '@app/configuration/const-time';
import { GameInformation } from '@app/interfaces/game-information';
import { ImagePath } from '@app/interfaces/hint-diff-path';
// import { Vec2 } from '@app/interfaces/vec2';
// import { MouseButton } from '@app/components/play-area/play-area.component';
import { GameDatabaseService } from '@app/services/game-database.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { Game, GameRecord } from '@common/game';
import { Observable } from 'rxjs';
import * as constants from '@app/configuration/const-canvas';

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
    // errorPenalty: boolean;
    // mousePosition: Vec2;
    private renderer: Renderer2;

    // eslint-disable-next-line max-params
    constructor(
        rendererFactory: RendererFactory2,
        public dialog: MatDialog,
        private gameDataBase: GameDatabaseService,
        private socket: SocketClientService,
    ) {
        // this.errorPenalty = false;
        // this.mousePosition = { x: 0, y: 0 };
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

        if (this.nDifferencesFound === this.totalDifferences && this.gameType === 'solo') {
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
        if (this.totalDifferences % 2 === 0) {
            return this.nDifferencesFound === this.totalDifferences / 2;
        }
        return this.nDifferencesFound === (this.totalDifferences + 1) / 2;
    }

    sendFoundMessage(): void {
        const foundMessage = {
            message:
                new Date().getHours() +
                ':' +
                new Date().getMinutes() +
                ':' +
                new Date().getSeconds() +
                ' - ' +
                ' Différence trouvée par ' +
                this.playerName,
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
        const errorMessage = {
            message: new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + ' - ' + ' Erreur par ' + this.playerName,
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

    // mouseHitDetect(event: MouseEvent) {
    //     if (event.button === MouseButton.Left && !this.errorPenalty) {
    //         this.mousePosition = { x: event.offsetX, y: event.offsetY };
    //         const distMousePosition: number = this.mousePosition.x + this.mousePosition.y * this.width;
    //         const diff = this.unfoundedDifference.find((set) => set.has(distMousePosition));
    //         if (diff) {
    //             this.drawDifference(diff);
    //             this.unfoundedDifference = this.unfoundedDifference.filter((set) => set !== diff);
    //             this.socket.sendDifference(diff, this.socket.getRoomName());
    //             this.displayWord('Trouvé');
    //             this.sendFoundMessage();
    //             this.handleDifferenceFound();
    //         } else {
    //             this.errorPenalty = true;
    //             this.displayWord('Erreur');
    //             this.sendErrorMessage();
    //         }
    //         this.clearCanvas();
    //     }
    // }
}
