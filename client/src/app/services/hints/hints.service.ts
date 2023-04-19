import { ElementRef, Injectable } from '@angular/core';
import { GameMessageEvent } from '@app/classes/game-records/message-event';
import { StartHintsRecord } from '@app/classes/game-records/start-hints';
import { StopHintsRecord } from '@app/classes/game-records/stop-hints';
import * as constantsCanvas from '@app/configuration/const-canvas';
import * as constantsQuadrant from '@app/configuration/const-quadrant';
import * as constantsTime from '@app/configuration/const-time';
import { Point } from '@app/interfaces/point';
import { DrawService } from '@app/services/draw/draw.service';
import { GameDatabaseService } from '@app/services/game/game-database.service';
import { GameRecorderService } from '@app/services/game/game-recorder.service';
import { HintsDisplayService } from '@app/services/hints/hints-display.service';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
import { ImageDiffService } from '@app/services/image-diff/image-diff.service';
import { TimeConfig } from '@common/game';
import confetti from 'canvas-confetti';
export interface Quadrant {
    x: number;
    y: number;
    w: number;
    h: number;
    isInnerQuadrant: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class HintsService {
    blinking: ReturnType<typeof setTimeout>;
    isHintsActive: boolean = false;
    canvas0: ElementRef<HTMLCanvasElement>;
    canvas1: ElementRef<HTMLCanvasElement>;
    unfoundedDifference: Set<number>[];
    indexEvent: number | undefined;
    color: string = 'black';
    nHintsLeft: number = 3;
    randomQuadrant: number[] = [];
    gameMode: string;
    outerQuadrant: Quadrant = { x: 0, y: 0, w: constantsCanvas.DEFAULT_WIDTH / 2, h: constantsCanvas.DEFAULT_HEIGHT / 2, isInnerQuadrant: false };
    innerQuadrant1: Quadrant = {
        x: 0,
        y: 0,
        w: constantsCanvas.DEFAULT_WIDTH / constantsQuadrant.QUARTER,
        h: constantsCanvas.DEFAULT_HEIGHT / constantsQuadrant.QUARTER,
        isInnerQuadrant: true,
    };
    innerQuadrant2: Quadrant = {
        x: constantsCanvas.DEFAULT_WIDTH / 2,
        y: 0,
        w: constantsCanvas.DEFAULT_WIDTH / constantsQuadrant.QUARTER,
        h: constantsCanvas.DEFAULT_HEIGHT / constantsQuadrant.QUARTER,
        isInnerQuadrant: true,
    };
    innerQuadrant3: Quadrant = {
        x: 0,
        y: constantsCanvas.DEFAULT_HEIGHT / 2,
        w: constantsCanvas.DEFAULT_WIDTH / constantsQuadrant.QUARTER,
        h: constantsCanvas.DEFAULT_HEIGHT / constantsQuadrant.QUARTER,
        isInnerQuadrant: true,
    };
    innerQuadrant4: Quadrant = {
        x: constantsCanvas.DEFAULT_WIDTH / 2,
        y: constantsCanvas.DEFAULT_HEIGHT / 2,
        w: constantsCanvas.DEFAULT_WIDTH / constantsQuadrant.QUARTER,
        h: constantsCanvas.DEFAULT_HEIGHT / constantsQuadrant.QUARTER,
        isInnerQuadrant: true,
    };

    penaltyHint: number;

    // eslint-disable-next-line max-params
    constructor(
        private readonly hotkeysService: HotkeysService,
        private readonly hintsDisplayService: HintsDisplayService,
        public gameRecorderService: GameRecorderService,
        public imageDiffService: ImageDiffService,
        private gameDatabaseService: GameDatabaseService,
    ) {
        this.hintsDisplayService.setIcons();
    }

    hintsKeyBinding(): void {
        this.indexEvent = this.hotkeysService.hotkeysEventListener(['i'], true, this.triggerHints.bind(this));
        this.gameDatabaseService.getConstants().subscribe((timeConfig: TimeConfig) => (this.penaltyHint = timeConfig.timePen));
    }

    generateRandomMaxNumber(max: number): number {
        return Math.floor(Math.random() * Math.floor(max));
    }

    createPossibleQuadrantArray(coordinates: Point, quadrant: Quadrant, possibleQuadrant: Set<number>): Set<number> {
        if (coordinates.y <= quadrant.y + quadrant.h) {
            if (coordinates.x <= quadrant.x + quadrant.w) {
                possibleQuadrant.add(constantsQuadrant.QUADRANT_UP_LEFT);
            } else {
                possibleQuadrant.add(constantsQuadrant.QUADRANT_UP_RIGHT);
            }
        } else {
            if (coordinates.x <= quadrant.x + quadrant.w) {
                possibleQuadrant.add(constantsQuadrant.QUADRANT_DOWN_LEFT);
            } else {
                possibleQuadrant.add(constantsQuadrant.QUADRANT_DOWN_RIGHT);
            }
        }
        return possibleQuadrant;
    }

    generatePossibleQuadrant(quadrant: Quadrant): number {
        let possibleQuadrant: Set<number> = new Set<number>();
        let coordinates: Point;
        const quadrantWidthLowerBound = quadrant.isInnerQuadrant ? quadrant.x : 0;
        const quadrantWidthUpperBound = quadrant.isInnerQuadrant ? quadrant.x + constantsCanvas.DEFAULT_WIDTH / 2 : constantsCanvas.DEFAULT_WIDTH;
        const quadrantHeightLowerBound = quadrant.isInnerQuadrant ? quadrant.y : 0;
        const quadrantHeightUpperBound = quadrant.isInnerQuadrant ? quadrant.y + constantsCanvas.DEFAULT_HEIGHT / 2 : constantsCanvas.DEFAULT_HEIGHT;
        for (const set of this.unfoundedDifference) {
            coordinates = this.imageDiffService.getPositionFromAbsolute(set.entries().next().value[1]);
            if (coordinates.x <= quadrantWidthUpperBound && coordinates.x >= quadrantWidthLowerBound) {
                if (coordinates.y <= quadrantHeightUpperBound && coordinates.y >= quadrantHeightLowerBound) {
                    possibleQuadrant = this.createPossibleQuadrantArray(coordinates, quadrant, possibleQuadrant);
                }
            }
        }
        const index = this.generateRandomMaxNumber(possibleQuadrant.size);
        return [...possibleQuadrant][index];
    }

    displayQuadrant(quadrant: Quadrant, isLastHint: boolean): void {
        const x = quadrant.x;
        const y = quadrant.y;
        const w = quadrant.w;
        const h = quadrant.h;
        if (isLastHint) {
            confetti({
                spread: 360,
                ticks: 50,
                gravity: 0,
                decay: 0.94,
                startVelocity: 15,
                shapes: ['star'],
                colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],
                particleCount: 50,
                origin: {
                    x: (this.canvas0.nativeElement.getBoundingClientRect().left + x + w / 2) / constantsQuadrant.SCREEN_WIDTH,
                    y: (this.canvas0.nativeElement.getBoundingClientRect().top + y + h) / constantsQuadrant.SCREEN_HEIGHT,
                },
            });
            confetti({
                spread: 360,
                ticks: 50,
                gravity: 0,
                decay: 0.94,
                startVelocity: 15,
                shapes: ['star'],
                colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],
                particleCount: 50,
                origin: {
                    x: (this.canvas1.nativeElement.getBoundingClientRect().left + x + w / 2) / constantsQuadrant.SCREEN_WIDTH,
                    y: (this.canvas1.nativeElement.getBoundingClientRect().top + y + h) / constantsQuadrant.SCREEN_HEIGHT,
                },
            });
        } else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.canvas0.nativeElement.getContext('2d')!.fillStyle = this.color;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.canvas0.nativeElement.getContext('2d')!.fillRect(x, y, w, h);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.canvas1.nativeElement.getContext('2d')!.fillStyle = this.color;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.canvas1.nativeElement.getContext('2d')!.fillRect(x, y, w, h);
        }
    }

    findQuadrant(quadrant: Quadrant, currentQuadrant: number, isLastHint: boolean): void {
        const quadrantUpLeft = { ...quadrant };
        const quadrantUpRight = { x: quadrant.x + quadrant.w, y: quadrant.y, w: quadrant.w, h: quadrant.h, isInnerQuadrant: true };
        const quadrantDownLeft = { x: quadrant.x, y: quadrant.y + quadrant.h, w: quadrant.w, h: quadrant.h, isInnerQuadrant: true };
        const quadrantDownRight = { x: quadrant.x + quadrant.w, y: quadrant.y + quadrant.h, w: quadrant.w, h: quadrant.h, isInnerQuadrant: true };
        let blinkCount = 0;
        this.color = 'rgba(248, 65, 31, 0.5)';
        switch (currentQuadrant) {
            case constantsQuadrant.QUADRANT_UP_LEFT: {
                this.displayQuadrant(quadrantUpLeft, isLastHint);
                break;
            }
            case constantsQuadrant.QUADRANT_UP_RIGHT: {
                this.displayQuadrant(quadrantUpRight, isLastHint);
                break;
            }
            case constantsQuadrant.QUADRANT_DOWN_LEFT: {
                this.displayQuadrant(quadrantDownLeft, isLastHint);
                break;
            }
            case constantsQuadrant.QUADRANT_DOWN_RIGHT: {
                this.displayQuadrant(quadrantDownRight, isLastHint);
                break;
            }
        }
        this.blinking = setInterval(() => {
            blinkCount++;
            if (blinkCount === constantsTime.BLINKING_COUNT * 2) this.stopHints();
        }, constantsTime.BLINKING_TIMEOUT);
    }

    findInnerQuadrant(outerQuadrant: number, innerQuadrant: number, isLastHint: boolean): void {
        switch (outerQuadrant) {
            case constantsQuadrant.QUADRANT_UP_LEFT: {
                this.findQuadrant(this.innerQuadrant1, innerQuadrant, isLastHint);
                break;
            }
            case constantsQuadrant.QUADRANT_UP_RIGHT: {
                this.findQuadrant(this.innerQuadrant2, innerQuadrant, isLastHint);
                break;
            }
            case constantsQuadrant.QUADRANT_DOWN_LEFT: {
                this.findQuadrant(this.innerQuadrant3, innerQuadrant, isLastHint);
                break;
            }
            case constantsQuadrant.QUADRANT_DOWN_RIGHT: {
                this.findQuadrant(this.innerQuadrant4, innerQuadrant, isLastHint);
                break;
            }
        }
    }

    showHints(): void {
        switch (this.nHintsLeft) {
            case 3: {
                this.findQuadrant(this.outerQuadrant, this.randomQuadrant[0], false);
                this.nHintsLeft--;
                this.hintsDisplayService.updateIcons();
                break;
            }
            case 2: {
                this.findInnerQuadrant(this.randomQuadrant[1], this.randomQuadrant[2], false);
                this.nHintsLeft--;
                this.hintsDisplayService.updateIcons();
                break;
            }
            case 1: {
                this.findInnerQuadrant(this.randomQuadrant[3], this.randomQuadrant[4], true);
                this.nHintsLeft--;
                this.hintsDisplayService.updateIcons();
                this.removeHotkeysEventListener();
                break;
            }
        }
    }

    removeDifference(diff: Set<number>): void {
        this.unfoundedDifference = this.unfoundedDifference.filter((set) => !this.eqSet(set, diff));
    }

    handleRandomInnerQuadrant(outerQuadrant: number): void {
        switch (outerQuadrant) {
            case constantsQuadrant.QUADRANT_UP_LEFT: {
                this.randomQuadrant.push(this.generatePossibleQuadrant(this.innerQuadrant1));
                break;
            }
            case constantsQuadrant.QUADRANT_UP_RIGHT: {
                this.randomQuadrant.push(this.generatePossibleQuadrant(this.innerQuadrant2));
                break;
            }
            case constantsQuadrant.QUADRANT_DOWN_LEFT: {
                this.randomQuadrant.push(this.generatePossibleQuadrant(this.innerQuadrant3));
                break;
            }
            case constantsQuadrant.QUADRANT_DOWN_RIGHT: {
                this.randomQuadrant.push(this.generatePossibleQuadrant(this.innerQuadrant4));
                break;
            }
        }
    }

    handleRandomQuadrant(): void {
        this.randomQuadrant.push(this.generatePossibleQuadrant(this.outerQuadrant));
        if (this.nHintsLeft === 2) {
            this.handleRandomInnerQuadrant(this.randomQuadrant[1]);
        } else if (this.nHintsLeft === 1) {
            this.handleRandomInnerQuadrant(this.randomQuadrant[3]);
        }
    }

    triggerHints(): void {
        this.hintsDisplayService.modifyTime(this.gameMode);
        new GameMessageEvent(this.hintsDisplayService.sendHintMessage()).record(this.gameRecorderService);
        this.handleRandomQuadrant();
        this.isHintsActive = !this.isHintsActive;
        if (this.isHintsActive) {
            new StartHintsRecord(this.penaltyHint).record(this.gameRecorderService);
            this.isHintsActive = !this.isHintsActive;
        } else {
            new StopHintsRecord().record(this.gameRecorderService);
            this.isHintsActive = !this.isHintsActive;
        }
    }

    stopHints(): void {
        clearInterval(this.blinking);
        this.clearCanvas(this.canvas0.nativeElement, this.canvas1.nativeElement);
    }

    drawDifference(diff: Set<number>): void {
        DrawService.drawDiff(diff, this.canvas0.nativeElement, this.color);
        DrawService.drawDiff(diff, this.canvas1.nativeElement, this.color);
    }

    removeHotkeysEventListener(): void {
        // indexEvent is undefined when the user is not in the game and indexEvent is possibly 0 so we can't use !indexEvent
        if (this.indexEvent === undefined) return;
        this.hotkeysService.removeHotkeysEventListener(this.indexEvent);
        this.indexEvent = undefined;
    }

    clearCanvas(canvasA: HTMLCanvasElement, canvasB: HTMLCanvasElement): void {
        DrawService.clearDiff(canvasA);
        DrawService.clearDiff(canvasB);
    }

    resetService(): void {
        this.hintsDisplayService.setIcons();
        this.nHintsLeft = 3;
        this.isHintsActive = false;
        clearInterval(this.blinking);
        this.unfoundedDifference = new Array();
        confetti.reset();
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
