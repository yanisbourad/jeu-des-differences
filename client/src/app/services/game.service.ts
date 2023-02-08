import { ElementRef, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { GameInformation } from '@app/interfaces/game-information';
import { ImagePath } from '@app/interfaces/hint-diff-path';
import { DrawService } from './draw.service';
import { ClientTimeService } from './client-time.service';
import { SocketClientService } from './socket-client.service';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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

    gameInformation: GameInformation = {
        gameTitle: 'Titre du jeu',
        gameMode: 'Partie Classique en mode solo',
        gameDifficulty: 'Difficile',
        nDifferences: 8,
        nHints: 3,
        hintsPenalty: 5,
        isClassical: true,
    };

    nDifferencesNotFound: number = this.gameInformation.nDifferences;
    nDifferencesFound: number = 0;
    differencesArray: string[] = new Array(this.nDifferencesNotFound);
    isGameFinished: boolean = false;

    nHintsUnused: number = this.gameInformation.nHints;
    nHintsUsed: number = 0;
    hintsArray: string[] = new Array(this.nHintsUnused);
    roomName: string;
    playerName: string = 'JAYJAY';
    isplaying: boolean = false;
    private renderer: Renderer2;
    constructor(
        private readonly socket: SocketClientService,
        private readonly drawService: DrawService,
        rendererFactory: RendererFactory2,
        public dialog: MatDialog,
        private readonly clientTimeService: ClientTimeService,
    ) {
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

    // generateUniqueRoomName
    generatePlayerRoomName(): string {
        return this.playerName + 'room';
    }

    displayIcons(): void {
        for (let i = 0; i < this.nDifferencesNotFound; i++) {
            this.differencesArray[i] = this.path.differenceNotFound;
        }

        for (let i = 0; i < this.nHintsUnused; i++) {
            this.hintsArray[i] = this.path.hintUnused;
        }
    }

    async blinkDifference(canvas: ElementRef<HTMLCanvasElement>): Promise<void> {
        // const ctx = canvas.nativeElement.getContext('2d');
        // const img = new Image();
        let visible = true;
        let blinkCount = 0;
        const originalImage = new Image();
        // const modified_image = new Image();
        // original_image.src = '../../../assets/img/k3FhRA.jpg';
        // console.log(original_image.src)
        createImageBitmap(originalImage).then((imageBitmap) => {
            this.drawService.drawImage(imageBitmap, canvas.nativeElement);
        });
        // modified_image.src = '../../../assets/img/k3FhRA.jpg';
        // createImageBitmap(modified_image).then((imageBitmap) => {
        // this.drawService.drawImage(imageBitmap,this.canvas2.nativeElement);
        // })
        const intervalId = setInterval(() => {
            visible = !visible;
            this.renderer.setStyle(canvas.nativeElement, 'visibility', visible ? 'visible' : 'hidden');
            blinkCount++;

            if (blinkCount === 8) {
                clearInterval(intervalId);
            }
        }, 125);
    }
    displayGameEnded(msg: string, type: string, time: number) {
        // display modal
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
