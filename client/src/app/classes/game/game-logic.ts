import { ElementRef, Renderer2, RendererFactory2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { DrawService } from '@app/services/draw.service';
import * as constantsTime from '@app/configuration/const-time';
import * as constants from '@app/configuration/const-canvas';
import { Vec2 } from '@app/interfaces/vec2';
// import { Observable } from 'rxjs';
// import { HttpResponse } from '@angular/common/http';

export abstract class GameLogic {
    // canvas1: ElementRef<HTMLCanvasElement>;
    // canvas2: ElementRef<HTMLCanvasElement>;
    // canvasCheat0: ElementRef<HTMLCanvasElement>;
    // canvasCheat1: ElementRef<HTMLCanvasElement>;
    mousePosition: Vec2;
    errorPenalty: boolean;
    private renderer: Renderer2;

    constructor(private dialog: MatDialog, private drawService: DrawService, rendererFactory: RendererFactory2) {
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

    displayGiveUp(msg: string, type: string): void {
        this.dialog.open(MessageDialogComponent, {
            data: [msg, type],
            minWidth: '250px',
            minHeight: '150px',
            panelClass: 'custom-dialog-container',
        });
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

    // drawDifference(diff: Set<number>, isCheating: boolean = false): void {
    //     if (!isCheating) {
    //         this.drawService.drawDiff(diff, this.canvas1.nativeElement);
    //         this.drawService.drawDiff(diff, this.canvas2.nativeElement);
    //     } else {
    //         this.drawService.drawDiff(diff, this.canvasCheat0.nativeElement);
    //         this.drawService.drawDiff(diff, this.canvasCheat1.nativeElement);
    //     }
    // }

    clearCanvas(canvasA: HTMLCanvasElement, canvasB: HTMLCanvasElement): void {
        setTimeout(() => {
            this.drawService.clearDiff(canvasA);
            this.drawService.clearDiff(canvasB);
        }, constantsTime.BLINKING_TIME);
    }

    clearCanvasCheat(canvasA: HTMLCanvasElement, canvasB: HTMLCanvasElement): void {
        this.drawService.clearDiff(canvasA);
        this.drawService.clearDiff(canvasB);
    }

    eqSet(set1: Set<number>, set2: Set<number>): boolean {
        return (
            set1.size === set2.size &&
            [...set1].every((x) => {
                return set2.has(x);
            })
        );
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

    displayWord(word: string, canvas0: ElementRef<HTMLCanvasElement>, canvas3: ElementRef<HTMLCanvasElement>, mousePosition: Vec2): void {
        this.drawService.drawWord(word, canvas0.nativeElement, mousePosition);
        this.drawService.drawWord(word, canvas3.nativeElement, mousePosition);
        if (word === 'Erreur') {
            this.playFailureAudio();
            setTimeout(() => {
                // errorPenalty = false;
            }, constantsTime.BLINKING_TIME);
        } else {
            this.playSuccessAudio();
            this.blinkDifference(this.canvas1, this.canvas2);
        }
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

    getGameTime(gameTime: number): string {
        const minutes = Math.floor(gameTime / constantsTime.MIN_TO_SEC);
        const seconds = gameTime - minutes * constantsTime.MIN_TO_SEC;
        return `${minutes}:${seconds < constantsTime.UNIT ? '0' : ''}${seconds}`;
    }

    // deleteGame(gameName: string): Observable<HttpResponse<string>> {
    //     this.gameCardHandlerService.handleDelete(gameName);
    //     return this.gameDataBase.deleteGame(gameName);
    // }

    abstract displayIcons(): void;
    abstract handleDifferenceFound(): void;
    abstract saveGameRecord(): void;
    abstract sendFoundMessage(): void;
    abstract sendErrorMessage(): void;
}
