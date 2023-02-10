import { ElementRef, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { GameInformation } from '@app/interfaces/game-information';
import { ImagePath } from '@app/interfaces/hint-diff-path';
import { GameDatabaseService } from '@app/services/game-database.sercice';
import { Game } from '@common/game';
import { ClientTimeService } from './client-time.service';
// import { DrawService } from './draw.service';
import { SocketClientService } from './socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    path: ImagePath = {
        differenceNotFound: '../../../assets/img/difference-not-found.png',
        differenceFound: '../../../assets/img/difference-found.png',
        hintUnused: '../../../assets/img/hint-unused.png',
        hintUsed: '../../../assets/img/hint-used.png',
    };

    game: Game;
    gameInformation: GameInformation;

    nDifferencesNotFound: number;
    nDifferencesFound: number = 0;
    differencesArray: string[];
    isGameFinished: boolean = false;

    nHintsUnused: number;
    nHintsUsed: number;
    hintsArray: string[];
    roomName: string;
    playerName: string;
    isplaying: boolean = false;
    private renderer: Renderer2;

    constructor(
        private readonly socket: SocketClientService,
        rendererFactory: RendererFactory2,
        public dialog: MatDialog,
        private readonly clientTimeService: ClientTimeService,
        private gameDataBase: GameDatabaseService,
    ) {
        this.gameInformation = {
            gameTitle: '',
            gameMode: 'Partie Classique en mode solo',
            gameDifficulty: '',
            nDifferences: 0,
            nHints: 3,
            hintsPenalty: 0,
            isClassical: false,
        };
        this.roomName = this.generatePlayerRoomName();
        this.renderer = rendererFactory.createRenderer(null, null);
    }

    clickGetHints(): void {
        if (this.nDifferencesFound < this.nDifferencesNotFound) {
            if (this.socket.getHintLeft() <= this.nHintsUnused) {
                this.nHintsUsed++;
                this.hintsArray.shift();
                this.hintsArray.push(this.path.hintUsed);
                console.log(this.roomName);
                this.socket.addTime(this.gameInformation.hintsPenalty, this.roomName);
            }
        }
    }
    defineVariables(): void {
        ///  this.getGame('Game name 1');
        this.gameInformation.gameTitle = this.game.gameName;
        this.gameInformation.gameDifficulty = this.game.difficulty;
        this.gameInformation.nDifferences = this.game.listDifferences.length;
        this.nDifferencesNotFound = this.gameInformation.nDifferences;
        this.nHintsUnused = this.gameInformation.nHints;
        this.gameInformation.nHints = 3;
        this.gameInformation.hintsPenalty = 5;
        this.differencesArray = new Array(this.nDifferencesNotFound);
        this.hintsArray = new Array(this.nHintsUnused);
        this.roomName = this.generatePlayerRoomName();
        this.isplaying = false;
    }
    // generateUniqueRoomName
    generatePlayerRoomName(): string {
        return this.playerName + 'room';
    }

    // getgame from database serveur
    getGame(gameName: string): void {
        this.gameDataBase.getGameByName(gameName).subscribe((res: Game) => {
            // console.log(res, "you are here!!")
            this.game = res;
            // console.log(this.game)
            this.defineVariables();
        });
    }

    displayIcons(): void {
        console.log(this.nDifferencesNotFound, this.nDifferencesFound, this.nHintsUnused, this.nHintsUsed);
        for (let i = 0; i < this.nDifferencesNotFound; i++) {
            this.differencesArray[i] = this.path.differenceNotFound;
        }
        console.log(this.differencesArray);
        for (let i = 0; i < this.nHintsUnused; i++) {
            this.hintsArray[i] = this.path.hintUnused;
        }
    }

    async blinkDifference(canvas1: ElementRef<HTMLCanvasElement>, canvas2: ElementRef<HTMLCanvasElement>): Promise<void> {
        let visible = true;
        let blinkCount = 0;
        const intervalId = setInterval(() => {
            visible = !visible;
            this.renderer.setStyle(canvas1.nativeElement, 'visibility', visible ? 'visible' : 'hidden');
            this.renderer.setStyle(canvas2.nativeElement, 'visibility', visible ? 'visible' : 'hidden');

            blinkCount++;
            if (blinkCount === 8) {
                clearInterval(intervalId);
            }
        }, 125);
    }
    displayGameEnded(msg: string, type: string, time: number) {
        this.dialog.open(MessageDialogComponent, {
            data: [msg, type, time],
            disableClose: true,
            minWidth: '250px',
            minHeight: '250px',
            panelClass: 'custom-dialog-container',
        });
        // to put when number of difference found equal max difference
        // this.clientTimeService.stopTimer();
        // console.log(this.clientTimeService.getCount())
        // this.displayGameEnded("Félicitation, vous avez terminée la partie", "finished", this.clientTimeService.getCount());
    }

    reinitializeGame(): void {
        this.isGameFinished = false;
        this.nDifferencesFound = 0;
        this.nHintsUsed = 0;
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
            this.displayGameEnded('Félicitation, vous avez terminée la partie', 'finished', this.clientTimeService.getCount());
            // Hard reset variables
            this.reinitializeGame();
        }
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
