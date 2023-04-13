import { ElementRef, Injectable } from '@angular/core';
import { StartHintsRecord } from '@app/classes/game-records/start-hints';
import { StopHintsRecord } from '@app/classes/game-records/stop-hints';
import * as constantsTime from '@app/configuration/const-time';
import { DrawService } from './draw.service';
import { GameRecorderService } from './game-recorder.service';
import { HotkeysService } from './hotkeys.service';
import * as constantsCanvas from '@app/configuration/const-canvas';
import { ImageDiffService } from './image-diff.service';
import { Point } from '@app/interfaces/point';
import * as constantsQuadrant from '@app/configuration/const-quadrant';

export interface Quadrant {
    x: number;
    y: number;
    w: number;
    h: number;
}

@Injectable({
    providedIn: 'root',
})
export class HintsService {
    blinking: ReturnType<typeof setTimeout>;
    isCheating: boolean = false;
    canvas0: ElementRef<HTMLCanvasElement>;
    canvas1: ElementRef<HTMLCanvasElement>;
    unfoundedDifference: Set<number>[];
    indexEvent: number | undefined;
    color: string = 'black';
    count: number = 3;

    outerQuadrant: Quadrant = { x: 0, y: 0, w: constantsCanvas.DEFAULT_WIDTH / 2, h: constantsCanvas.DEFAULT_HEIGHT / 2 };

    innerQuadrant1: Quadrant = {
        x: 0,
        y: 0,
        w: constantsCanvas.DEFAULT_WIDTH / constantsQuadrant.QUARTER,
        h: constantsCanvas.DEFAULT_HEIGHT / constantsQuadrant.QUARTER,
    };
    innerQuadrant2: Quadrant = {
        x: constantsCanvas.DEFAULT_WIDTH / 2,
        y: 0,
        w: constantsCanvas.DEFAULT_WIDTH / constantsQuadrant.QUARTER,
        h: constantsCanvas.DEFAULT_HEIGHT / constantsQuadrant.QUARTER,
    };
    innerQuadrant3: Quadrant = {
        x: 0,
        y: constantsCanvas.DEFAULT_HEIGHT / 2,
        w: constantsCanvas.DEFAULT_WIDTH / constantsQuadrant.QUARTER,
        h: constantsCanvas.DEFAULT_HEIGHT / constantsQuadrant.QUARTER,
    };
    innerQuadrant4: Quadrant = {
        x: constantsCanvas.DEFAULT_WIDTH / 2,
        y: constantsCanvas.DEFAULT_HEIGHT / 2,
        w: constantsCanvas.DEFAULT_WIDTH / constantsQuadrant.QUARTER,
        h: constantsCanvas.DEFAULT_HEIGHT / constantsQuadrant.QUARTER,
    };

    constructor(
        private readonly hotkeysService: HotkeysService,
        public gameRecorderService: GameRecorderService,
        public imageDiffService: ImageDiffService,
    ) {}

    hintsKeyBinding(): void {
        this.indexEvent = this.hotkeysService.hotkeysEventListener(['i'], true, this.toggleCheating.bind(this));
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

    generatePossibleInnerQuadrant(quadrant: Quadrant, isInnerQuadrant: boolean): number {
        let possibleQuadrant: Set<number> = new Set<number>();
        let coordinates: Point;
        const quadrantWidthLowerBound = isInnerQuadrant ? quadrant.x : 0;
        const quadrantWidthUpperBound = isInnerQuadrant ? quadrant.x + constantsCanvas.DEFAULT_WIDTH / 2 : constantsCanvas.DEFAULT_WIDTH;
        const quadrantHeightLowerBound = isInnerQuadrant ? quadrant.y : 0;
        const quadrantHeightUpperBound = isInnerQuadrant ? quadrant.y + constantsCanvas.DEFAULT_HEIGHT / 2 : constantsCanvas.DEFAULT_HEIGHT;

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

    displayQuadrant(quadrant: Quadrant): void {
        const x = quadrant.x;
        const y = quadrant.y;
        const w = quadrant.w;
        const h = quadrant.h;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.canvas0.nativeElement.getContext('2d')!.fillStyle = this.color;
        this.canvas0.nativeElement.getContext('2d')?.fillRect(x, y, w, h);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.canvas1.nativeElement.getContext('2d')!.fillStyle = this.color;
        this.canvas1.nativeElement.getContext('2d')?.fillRect(x, y, w, h);
    }

    findQuadrant(quadrant: Quadrant, isInnerQuadrant: boolean): void {
        const quadrantUpLeft = { ...quadrant };
        const quadrantUpRight = { x: quadrant.x + quadrant.w, y: quadrant.y, w: quadrant.w, h: quadrant.h };
        const quadrantDownLeft = { x: quadrant.x, y: quadrant.y + quadrant.h, w: quadrant.w, h: quadrant.h };
        const quadrantDownRight = { x: quadrant.x + quadrant.w, y: quadrant.y + quadrant.h, w: quadrant.w, h: quadrant.h };
        let blinkCount = 0;
        const currentQuadrant = this.generatePossibleInnerQuadrant(quadrant, isInnerQuadrant);
        this.blinking = setInterval(() => {
            this.color = this.color === 'rgba(255, 0, 0, 0.05)' ? 'rgba(0, 0, 0, 0)' : 'rgba(255, 0, 0, 0.05)';
            switch (currentQuadrant) {
                case constantsQuadrant.QUADRANT_UP_LEFT: {
                    this.displayQuadrant(quadrantUpLeft);
                    break;
                }
                case constantsQuadrant.QUADRANT_UP_RIGHT: {
                    this.displayQuadrant(quadrantUpRight);
                    break;
                }
                case constantsQuadrant.QUADRANT_DOWN_LEFT: {
                    this.displayQuadrant(quadrantDownLeft);
                    break;
                }
                case constantsQuadrant.QUADRANT_DOWN_RIGHT: {
                    this.displayQuadrant(quadrantDownRight);
                    break;
                }
            }
            blinkCount++;
            if (blinkCount === constantsTime.BLINKING_COUNT * 2) this.stopHints();
        }, constantsTime.BLINKING_TIMEOUT);
    }

    findInnerQuadrant(): void {
        const currentQuadrant = this.generatePossibleInnerQuadrant(this.outerQuadrant, false);
        switch (currentQuadrant) {
            case constantsQuadrant.QUADRANT_UP_LEFT: {
                this.findQuadrant(this.innerQuadrant1, true);
                break;
            }
            case constantsQuadrant.QUADRANT_UP_RIGHT: {
                this.findQuadrant(this.innerQuadrant2, true);
                break;
            }
            case constantsQuadrant.QUADRANT_DOWN_LEFT: {
                this.findQuadrant(this.innerQuadrant3, true);
                break;
            }
            case constantsQuadrant.QUADRANT_DOWN_RIGHT: {
                this.findQuadrant(this.innerQuadrant4, true);
                break;
            }
        }
    }

    showHints(): void {
        if (this.count === 3) {
            this.findQuadrant(this.outerQuadrant, false);
            this.count--;
        } else if (this.count === 2) {
            this.findInnerQuadrant();
            this.count--;
        }
    }

    removeDifference(diff: Set<number>): void {
        this.unfoundedDifference = this.unfoundedDifference.filter((set) => !this.eqSet(set, diff));
    }

    toggleCheating(): void {
        const chatBox = document.getElementById('chat-box');
        if (document.activeElement === chatBox) return;

        this.isCheating = !this.isCheating;
        if (this.isCheating) {
            new StartHintsRecord().record(this.gameRecorderService);
            this.isCheating = !this.isCheating;
        } else {
            new StopHintsRecord().record(this.gameRecorderService);
            this.isCheating = !this.isCheating;
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
        // indexEvent is undefined when the user is not in the game
        // indexEvent is possibly 0 so we can't use !indexEvent
        if (this.indexEvent === undefined) return;
        this.hotkeysService.removeHotkeysEventListener(this.indexEvent);
        this.indexEvent = undefined;
    }

    clearCanvas(canvasA: HTMLCanvasElement, canvasB: HTMLCanvasElement): void {
        DrawService.clearDiff(canvasA);
        DrawService.clearDiff(canvasB);
    }

    resetService(): void {
        this.count = 3;
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
