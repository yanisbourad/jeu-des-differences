import { ElementRef, Injectable } from '@angular/core';
import { StartCheatModeRecord } from '@app/classes/game-records/start-cheat-mode';
import { StopCheatModeRecord } from '@app/classes/game-records/stop-cheat-mode';
import * as constantsTime from '@app/configuration/const-time';
import { DrawService } from '@app/services/draw/draw.service';
import { GameRecorderService } from '@app/services/game/game-recorder.service';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';

@Injectable({
    providedIn: 'root',
})
export class CheatModeService {
    blinking: ReturnType<typeof setTimeout>;
    isCheating: boolean = false;
    canvas0: ElementRef<HTMLCanvasElement>;
    canvas1: ElementRef<HTMLCanvasElement>;
    unfoundedDifference: Set<number>[];
    indexEvent: number | undefined;
    color: string = 'black';

    constructor(private readonly hotkeysService: HotkeysService, public gameRecorderService: GameRecorderService) {}

    cheatModeKeyBinding(): void {
        this.indexEvent = this.hotkeysService.hotkeysEventListener(['t'], true, this.toggleCheating.bind(this));
    }

    cheatMode(): void {
        this.blinking = setInterval(() => {
            this.color = this.color === 'black' ? 'white' : 'black';
            for (const set of this.unfoundedDifference) {
                this.drawDifference(set);
            }
        }, constantsTime.BLINKING_TIMEOUT);
    }

    removeDifference(diff: Set<number>): void {
        this.unfoundedDifference = this.unfoundedDifference.filter((set) => !this.eqSet(set, diff));
    }

    toggleCheating(): void {
        const chatBox = document.getElementById('chat-box');
        if (document.activeElement === chatBox) return;

        this.isCheating = !this.isCheating;
        if (this.isCheating) {
            new StartCheatModeRecord().record(this.gameRecorderService);
        } else {
            new StopCheatModeRecord().record(this.gameRecorderService);
        }
    }

    stopCheating(): void {
        clearInterval(this.blinking);
        this.clearCanvasCheat(this.canvas0.nativeElement, this.canvas1.nativeElement);
    }

    drawDifference(diff: Set<number>): void {
        DrawService.drawDiff(diff, this.canvas0.nativeElement, this.color);
        DrawService.drawDiff(diff, this.canvas1.nativeElement, this.color);
    }

    removeHotkeysEventListener(): void {
        // indexEvent is undefined when the user is not in the game
        // indexEvent is possibly 0 so we can't use !indexEvent
        if (this.indexEvent === undefined) return;
        this.hotkeysService.removeHotkeysEventListener(this.indexEvent);
        this.indexEvent = undefined;
    }

    clearCanvasCheat(canvasA: HTMLCanvasElement, canvasB: HTMLCanvasElement): void {
        DrawService.clearDiff(canvasA);
        DrawService.clearDiff(canvasB);
    }

    resetService(): void {
        this.isCheating = false;
        clearInterval(this.blinking);
        this.unfoundedDifference = new Array();
    }

    eqSet(set1: Set<number>, set2: Set<number>): boolean {
        return (
            set1.size === set2.size &&
            [...set1].every((x) => {
                return set2.has(x);
            })
        );
    }
}
