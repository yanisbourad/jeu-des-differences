import { ElementRef } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import * as constantsTime from '@app/configuration/const-time';
import { GameDatabaseService } from '@app/services//game/game-database.service';
import { GameRecorderService } from '@app/services/game/game-recorder.service';
import { HintsDisplayService } from '@app/services/hints/hints-display.service';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
import { ImageDiffService } from '@app/services/image-diff/image-diff.service';
import { TimeConfig } from '@common/game';
import { Subject } from 'rxjs';
import { HintsService } from './hints.service';
import SpyObj = jasmine.SpyObj;

describe('HintsService', () => {
    let hintsService: HintsService;
    let hotkeysServiceSpy: SpyObj<HotkeysService>;
    let hintsDisplayServiceSpy: SpyObj<HintsDisplayService>;
    let gameRecorderServiceSpy: SpyObj<GameRecorderService>;
    let imageDiffServiceSpy: SpyObj<ImageDiffService>;
    let gameDatabaseServiceSpy: SpyObj<GameDatabaseService>;
    const dist = { dist1: 9000, dist2: 90000, dist3: 150000, dist4: 250000 };
    const quad = { quad1: 1, quad2: 2, quad3: 3, quad4: 4 };

    beforeEach(() => {
        hotkeysServiceSpy = jasmine.createSpyObj('HotkeysService', ['hotkeysEventListener', 'removeHotkeysEventListener']);
        hintsDisplayServiceSpy = jasmine.createSpyObj('HintsDisplayService', ['setIcons', 'updateIcons', 'sendHintMessage', 'modifyTime']);
        gameRecorderServiceSpy = jasmine.createSpyObj('GameRecorderService', ['do']);
        imageDiffServiceSpy = jasmine.createSpyObj('ImageDiffService', ['getPositionFromAbsolute']);
        gameDatabaseServiceSpy = jasmine.createSpyObj('GameDatabaseService', ['getConstants']);
        TestBed.configureTestingModule({
            providers: [
                { provide: HotkeysService, useValue: hotkeysServiceSpy },
                { provide: HintsDisplayService, useValue: hintsDisplayServiceSpy },
                { provide: GameRecorderService, useValue: gameRecorderServiceSpy },
                { provide: ImageDiffService, useValue: imageDiffServiceSpy },
                { provide: GameDatabaseService, useValue: gameDatabaseServiceSpy },
            ],
        });
        hintsService = TestBed.inject(HintsService);
        hintsService.canvas0 = new ElementRef<HTMLCanvasElement>(document.createElement('canvas'));
        hintsService.canvas1 = new ElementRef<HTMLCanvasElement>(document.createElement('canvas'));
    });

    it('should be created', () => {
        expect(hintsService).toBeTruthy();
    });

    it('hintsKeyBinding should call hotkeysService.hotkeysEventListener', () => {
        const subject = new Subject<TimeConfig>();
        gameDatabaseServiceSpy.getConstants.and.returnValue(subject);
        hintsService.hintsKeyBinding();
        subject.next({ timeInit: 0, timePen: 3, timeBonus: 0 } as TimeConfig);
        expect(hotkeysServiceSpy.hotkeysEventListener).toHaveBeenCalled();
        expect(hintsService.indexEvent).toBeUndefined();
        expect(hintsService.penaltyHint).toBe(3);
    });

    it('generateRandomMaxNumber should return a number between 0 and max', () => {
        const max = 10;
        const testResult = hintsService.generateRandomMaxNumber(max);
        expect(testResult).toBeGreaterThanOrEqual(0);
        expect(testResult).toBeLessThanOrEqual(max);
    });

    it('createPossibleQuadrantArray should return an array containing 1', () => {
        const coordinates = { x: 100, y: 50 };
        const quadrant = { x: 0, y: 0, w: 200, h: 100, isInnerQuadrant: false };
        const possibleQuadrant = new Set<number>();

        hintsService.createPossibleQuadrantArray(coordinates, quadrant, possibleQuadrant);
        expect(possibleQuadrant.has(1)).toBeTrue();
    });

    it('createPossibleQuadrantArray should return an array containing 2', () => {
        const coordinates = { x: 400, y: 50 };
        const quadrant = { x: 0, y: 0, w: 200, h: 100, isInnerQuadrant: false };
        const possibleQuadrant = new Set<number>();

        hintsService.createPossibleQuadrantArray(coordinates, quadrant, possibleQuadrant);
        expect(possibleQuadrant.has(2)).toBeTrue();
    });

    it('createPossibleQuadrantArray should return an array containing 3', () => {
        const coordinates = { x: 100, y: 300 };
        const quadrant = { x: 0, y: 0, w: 200, h: 100, isInnerQuadrant: false };
        const possibleQuadrant = new Set<number>();

        hintsService.createPossibleQuadrantArray(coordinates, quadrant, possibleQuadrant);
        expect(possibleQuadrant.has(3)).toBeTrue();
    });

    it('createPossibleQuadrantArray should return an array containing 4', () => {
        const coordinates = { x: 400, y: 300 };
        const quadrant = { x: 0, y: 0, w: 200, h: 100, isInnerQuadrant: false };
        const possibleQuadrant = new Set<number>();

        hintsService.createPossibleQuadrantArray(coordinates, quadrant, possibleQuadrant);
        expect(possibleQuadrant.has(quad.quad4)).toBeTrue();
    });

    it('generatePossibleQuadrant should return a random number between 1 and 4', () => {
        const quadrant = { x: 0, y: 0, w: 320, h: 240, isInnerQuadrant: false };
        const upperBound = 4;
        hintsService.unfoundedDifference = [new Set([dist.dist1, dist.dist2, dist.dist3, dist.dist4])];
        imageDiffServiceSpy.getPositionFromAbsolute.and.returnValue({ x: 100, y: 50 });
        const testResult = hintsService.generatePossibleQuadrant(quadrant);
        expect(testResult).toBeGreaterThanOrEqual(1);
        expect(testResult).toBeLessThanOrEqual(upperBound);
    });

    it('generatePossibleQuadrant should return a random number between 1 and 4 if isInnerQuadrant is true', () => {
        const quadrant = { x: 0, y: 0, w: 320, h: 240, isInnerQuadrant: true };
        const upperBound = 4;
        hintsService.unfoundedDifference = [new Set([dist.dist1, dist.dist2, dist.dist3, dist.dist4])];
        imageDiffServiceSpy.getPositionFromAbsolute.and.returnValue({ x: 100, y: 50 });
        const testResult = hintsService.generatePossibleQuadrant(quadrant);
        expect(testResult).toBeGreaterThanOrEqual(1);
        expect(testResult).toBeLessThanOrEqual(upperBound);
    });

    it('displayQuadrant should call fillStyle and fillRect if isLastHint is false', () => {
        const quadrant = { x: 0, y: 0, w: 320, h: 240, isInnerQuadrant: false };
        const isLastHintFalse = false;
        const isLastHintTrue = true;
        hintsService.displayQuadrant(quadrant, isLastHintTrue);
        spyOn(hintsService, 'displayQuadrant').and.callThrough();
        hintsService.displayQuadrant(quadrant, isLastHintFalse);
        hintsService.color = '#000000';
        spyOn(hintsService.canvas0.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'fillRect').and.callThrough();
        spyOn(hintsService.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'fillRect').and.callThrough();
        expect(hintsService.canvas0.nativeElement.getContext('2d')?.fillStyle).toEqual(hintsService.color);
        expect(hintsService.canvas0.nativeElement.getContext('2d')?.fillRect).not.toHaveBeenCalled();
        expect(hintsService.canvas1.nativeElement.getContext('2d')?.fillStyle).toEqual(hintsService.color);
        expect(hintsService.canvas1.nativeElement.getContext('2d')?.fillRect).not.toHaveBeenCalled();
    });

    it('findQuadrant should call displayQuadrant when currentQuadrant is between 1 and 4', fakeAsync(() => {
        const quadrant = { x: 0, y: 0, w: 320, h: 240, isInnerQuadrant: false };
        const currentQuadrant = [quad.quad1, quad.quad2, quad.quad3, quad.quad4];
        const isLastHint = false;
        spyOn(hintsService, 'findQuadrant').and.callThrough();
        spyOn(hintsService, 'displayQuadrant').and.callFake(() => ({}));
        spyOn(hintsService, 'stopHints').and.callFake(() => ({}));
        for (const q of currentQuadrant) {
            const lastQuadrantSize = hintsService.listOfQuadrants.length;
            hintsService.findQuadrant(quadrant, q, isLastHint);
            expect(hintsService.listOfQuadrants.length).toEqual(lastQuadrantSize + 1);
            tick(constantsTime.BLINKING_TIME * 3);
        }
    }));

    it('findInnerQuadrant should call findQuadrant when outerQuadrant', () => {
        const outerQuadrant = [quad.quad1, quad.quad2, quad.quad3, quad.quad4];
        const innerQuadrant = 1;
        const isLastHint = false;
        spyOn(hintsService, 'findInnerQuadrant').and.callThrough();
        spyOn(hintsService, 'findQuadrant').and.callFake(() => ({}));
        for (const q of outerQuadrant) {
            hintsService.findInnerQuadrant(q, innerQuadrant, isLastHint);
            expect(hintsService.findQuadrant).toHaveBeenCalled();
        }
    });

    it('showHints should call different methods with nHintsLeft', () => {
        spyOn(hintsService, 'showHints').and.callThrough();
        spyOn(hintsService, 'findQuadrant').and.callFake(() => ({}));
        spyOn(hintsService, 'findInnerQuadrant').and.callFake(() => ({}));
        spyOn(hintsService, 'removeHotkeysEventListener').and.callFake(() => ({}));
        expect(hintsService.nHintsLeft).toEqual(3);
        hintsService.showHints();
        expect(hintsService.findQuadrant).toHaveBeenCalled();
        expect(hintsService.nHintsLeft).toEqual(2);
        expect(hintsDisplayServiceSpy.updateIcons).toHaveBeenCalled();
        hintsService.showHints();
        expect(hintsService.findInnerQuadrant).toHaveBeenCalled();
        expect(hintsService.nHintsLeft).toEqual(1);
        expect(hintsDisplayServiceSpy.updateIcons).toHaveBeenCalled();
        hintsService.showHints();
        expect(hintsService.findInnerQuadrant).toHaveBeenCalled();
        expect(hintsService.nHintsLeft).toEqual(0);
        expect(hintsDisplayServiceSpy.updateIcons).toHaveBeenCalled();
        expect(hintsService.removeHotkeysEventListener).toHaveBeenCalled();
    });

    it('removeDifference should  call eqSet and removeDifferenceFromUnfoundedDifference', () => {
        const diff = new Set([dist.dist1, dist.dist2, dist.dist3, dist.dist4]);
        spyOn(hintsService, 'removeDifference').and.callThrough();
        spyOn(hintsService, 'eqSet').and.callThrough();
        hintsService.unfoundedDifference = [diff];
        hintsService.removeDifference(diff);
        hintsService.unfoundedDifference = hintsService.unfoundedDifference.filter((set) => !hintsService.eqSet(set, diff));
        expect(hintsService.eqSet).toHaveBeenCalled();
        expect(hintsService.unfoundedDifference).toEqual([]);
    });

    it('handleRandomInnerQuadrant should call generatePossibleQuadrant', () => {
        const outerQuadrant = [quad.quad1, quad.quad2, quad.quad3, quad.quad4];
        spyOn(hintsService, 'handleRandomInnerQuadrant').and.callThrough();
        spyOn(hintsService, 'generatePossibleQuadrant').and.callFake(() => 1);
        for (const q of outerQuadrant) {
            hintsService.handleRandomInnerQuadrant(q);
            expect(hintsService.generatePossibleQuadrant).toHaveBeenCalled();
        }
    });

    it('handleRandomQuadrant should call generatePossibleQuadrant and handleRandomInnerQuadrant', () => {
        spyOn(hintsService, 'handleRandomQuadrant').and.callThrough();
        spyOn(hintsService, 'generatePossibleQuadrant').and.callFake(() => 1);
        spyOn(hintsService, 'handleRandomInnerQuadrant').and.callFake(() => ({}));
        hintsService.handleRandomQuadrant();
        expect(hintsService.generatePossibleQuadrant).toHaveBeenCalled();
        hintsService.nHintsLeft--;
        hintsService.handleRandomQuadrant();
        expect(hintsService.generatePossibleQuadrant).toHaveBeenCalled();
        expect(hintsService.handleRandomInnerQuadrant).toHaveBeenCalled();
        hintsService.nHintsLeft--;
        hintsService.handleRandomQuadrant();
        expect(hintsService.generatePossibleQuadrant).toHaveBeenCalled();
        expect(hintsService.handleRandomInnerQuadrant).toHaveBeenCalled();
    });

    it('triggerHints should call modifyTime, sendHintMessage and handleRandomQuadrant', () => {
        spyOn(hintsService, 'triggerHints').and.callThrough();
        spyOn(hintsService, 'handleRandomQuadrant').and.callFake(() => ({}));
        hintsService.triggerHints();
        expect(hintsDisplayServiceSpy.modifyTime).toHaveBeenCalled();
        expect(hintsDisplayServiceSpy.sendHintMessage).toHaveBeenCalled();
        expect(gameRecorderServiceSpy.do).toHaveBeenCalled();
        expect(hintsService.handleRandomQuadrant).toHaveBeenCalled();
        hintsService.isHintsActive = true;
        hintsService.triggerHints();
        expect(gameRecorderServiceSpy.do).toHaveBeenCalled();
        hintsService.isHintsActive = false;
        hintsService.triggerHints();
        expect(gameRecorderServiceSpy.do).toHaveBeenCalled();
    });

    it('stopHints should call clearInterval and clearCanvas', () => {
        spyOn(hintsService, 'stopHints').and.callThrough();
        spyOn(hintsService, 'clearCanvas').and.callFake(() => ({}));
        hintsService.stopHints();
        expect(hintsService.clearCanvas).toHaveBeenCalled();
    });

    it('drawDifference should call drawDiff', () => {
        const diff = new Set([dist.dist1, dist.dist2, dist.dist3, dist.dist4]);
        spyOn(hintsService, 'drawDifference').and.callThrough();
        hintsService.drawDifference(diff);
    });

    it('removeHotkeysEventListener should call not removeEventListener if indexEvent is undefined', () => {
        hintsService.indexEvent = undefined;
        spyOn(hintsService, 'removeHotkeysEventListener').and.callThrough();
        hintsService.removeHotkeysEventListener();
        expect(hotkeysServiceSpy.removeHotkeysEventListener).not.toHaveBeenCalled();
    });

    it('removeHotkeysEventListener should call removeEventListener if indexEvent is not undefined', () => {
        hintsService.indexEvent = 0;
        spyOn(hintsService, 'removeHotkeysEventListener').and.callThrough();
        hintsService.removeHotkeysEventListener();
        expect(hotkeysServiceSpy.removeHotkeysEventListener).toHaveBeenCalled();
        expect(hintsService.indexEvent).toBeUndefined();
    });

    it('clearCanvas should call clearDiff', () => {
        const canvasA = document.createElement('canvas');
        const canvasB = document.createElement('canvas');
        spyOn(hintsService, 'clearCanvas').and.callThrough();
        // spyOn(DrawService, 'clearDiff').and.callFake(() => ({}));
        hintsService.clearCanvas(canvasA, canvasB);
        expect(hintsService.clearCanvas).toHaveBeenCalled();
        // expect(DrawService.clearDiff).toHaveBeenCalled();
    });

    it('resetService should reinitialize all variables', () => {
        spyOn(hintsService, 'resetService').and.callThrough();
        hintsService.resetService();
        expect(hintsDisplayServiceSpy.setIcons).toHaveBeenCalled();
        expect(hintsService.nHintsLeft).toEqual(3);
        expect(hintsService.isHintsActive).toBe(false);
        expect(hintsService.unfoundedDifference).toEqual([]);
    });

    it('should return true if sets are equal', () => {
        const set1 = new Set([1, 2, 3]);
        const set2 = new Set([3, 2, 1]);
        expect(hintsService.eqSet(set1, set2)).toBe(true);
    });

    it('should return false if sets are not equal', () => {
        const set1 = new Set([1, 2, 3]);
        const set2 = new Set([0, 0, 0]);
        expect(hintsService.eqSet(set1, set2)).toBe(false);
    });

    it('should return false if sets are different sizes', () => {
        const set1 = new Set([1, 2, 3]);
        const set2 = new Set([1, 2]);
        expect(hintsService.eqSet(set1, set2)).toBe(false);
    });

    it('should call displayQuadrant', fakeAsync(() => {
        spyOn(hintsService, 'displayQuadrant').and.callThrough();
        spyOn(hintsService, 'stopHints').and.callThrough();
        hintsService.listOfQuadrants.push({
            quadrant: {
                x: 1,
                y: 1,
                w: 1,
                h: 1,
                isInnerQuadrant: true,
            },
            isLast: true,
        });
        hintsService.launchHints();
        tick(constantsTime.BLINKING_TIME);
        expect(hintsService.displayQuadrant).toHaveBeenCalled();
        expect(hintsService.stopHints).toHaveBeenCalled();
        hintsService.stopInterval();
    }));
});
