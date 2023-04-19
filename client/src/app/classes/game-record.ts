// this class will represent an action to be performed
// to the game view
// it will be implementing the do action

import { ElementRef } from '@angular/core';
import { BLINKING_COUNT, BLINKING_TIME, BLINKING_TIMEOUT } from '@app/configuration/const-time';
import { Vec2 } from '@app/interfaces/vec2';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { DrawService } from '@app/services/draw/draw.service';
import { GameRecorderService } from '@app/services/game/game-recorder.service';
export abstract class GameRecordCommand {
    time: number;
    penalty = 0;
    // the time the action was performed
    // in milliseconds
    // this will be used to determine the
    // order of the actions
    constructor() {
        // get the time the action was performed in seconds
        this.time = Date.now();
    }

    get timePenalty(): number {
        return this.penalty;
    }

    gameTime(startingTime: number): number {
        return this.time - startingTime || 0;
    }

    record(gameRecordService: GameRecorderService): void {
        gameRecordService.do(this);
    }

    displayWord(
        word: string,
        canvas: {
            canvas0: ElementRef<HTMLCanvasElement>;
            canvas1: ElementRef<HTMLCanvasElement>;
            canvas2: ElementRef<HTMLCanvasElement>;
            canvas3: ElementRef<HTMLCanvasElement>;
        },
        mousePosition: Vec2,
    ): void {
        DrawService.drawWord(word, canvas.canvas0.nativeElement, mousePosition);
        DrawService.drawWord(word, canvas.canvas3.nativeElement, mousePosition);
        if (word === 'Erreur') {
            this.playFailureAudio();
        } else {
            this.playSuccessAudio();
            this.blinkDifference(canvas.canvas1, canvas.canvas2);
        }
        this.clearCanvas(canvas.canvas0.nativeElement, canvas.canvas3.nativeElement);
    }

    async blinkDifference(canvas1: ElementRef<HTMLCanvasElement>, canvas2: ElementRef<HTMLCanvasElement>): Promise<void> {
        let isVisible = true;
        let blinkCount = 0;
        const intervalId = setInterval(() => {
            isVisible = !isVisible;
            canvas1.nativeElement.style.setProperty('visibility', isVisible ? 'visible' : 'hidden');
            canvas2.nativeElement.style.setProperty('visibility', isVisible ? 'visible' : 'hidden');
            blinkCount++;
            if (blinkCount === BLINKING_COUNT) {
                clearInterval(intervalId);
            }
        }, BLINKING_TIMEOUT);
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

    clearCanvas(canvasA: HTMLCanvasElement, canvasB: HTMLCanvasElement): void {
        setTimeout(() => {
            DrawService.clearDiff(canvasA);
            DrawService.clearDiff(canvasB);
        }, BLINKING_TIME);
    }

    abstract do(component: GamePageComponent): void;
}
