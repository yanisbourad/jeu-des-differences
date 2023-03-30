import { ElementRef, Injectable } from '@angular/core';
import { DrawService } from './draw.service';
import { HotkeysService } from './hotkeys.service';
import * as constantsTime from '@app/configuration/const-time';

@Injectable({
    providedIn: 'root',
})
export class CheatModeService {
    blinking: ReturnType<typeof setTimeout>;
    isCheating: boolean = false;
    canvas0: ElementRef<HTMLCanvasElement>;
    canvas1: ElementRef<HTMLCanvasElement>;
    unfoundedDifference: Set<number>[];

    constructor(private readonly hotkeysService: HotkeysService, private readonly drawService: DrawService) {}

    cheatModeKeyBinding(): number {
        return this.hotkeysService.hotkeysEventListener(['t'], true, this.toggleCheating.bind(this));
    }

    cheatMode(): void {
        this.blinking = setInterval(() => {
            this.drawService.setColor = this.drawService.getColor === 'black' ? 'yellow' : 'black';
            for (const set of this.unfoundedDifference) {
                this.drawDifference(set);
            }
        }, constantsTime.BLINKING_TIMEOUT);
    }

    toggleCheating(): void {
        this.isCheating = !this.isCheating;
        const chatBox = document.getElementById('chat-box');
        if (this.isCheating) {
            if (document.activeElement !== chatBox) {
                this.cheatMode();
            }
        } else {
            if (document.activeElement !== chatBox) clearInterval(this.blinking);
            this.clearCanvasCheat(this.canvas0.nativeElement, this.canvas1.nativeElement);
            this.drawService.setColor = 'black';
        }
    }

    drawDifference(diff: Set<number>): void {
        this.drawService.drawDiff(diff, this.canvas0.nativeElement);
        this.drawService.drawDiff(diff, this.canvas1.nativeElement);
    }

    removeHotkeysEventListener(idEventList: number): void {
        this.hotkeysService.removeHotkeysEventListener(idEventList);
    }

    clearCanvasCheat(canvasA: HTMLCanvasElement, canvasB: HTMLCanvasElement): void {
        this.drawService.clearDiff(canvasA);
        this.drawService.clearDiff(canvasB);
    }

    resetService(): void {
        this.isCheating = false;
        clearInterval(this.blinking);
        this.drawService.setColor = 'black';
        this.unfoundedDifference = new Array();
    }
}
