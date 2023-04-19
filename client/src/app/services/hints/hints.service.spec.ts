import { TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { HintsService } from './hints.service';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
import SpyObj = jasmine.SpyObj;
import { HintsDisplayService } from '@app/services/hints/hints-display.service';
import { GameRecorderService } from '@app/services/game/game-recorder.service';
import { ImageDiffService } from '@app/services/image-diff/image-diff.service';

describe('HintsService', () => {
    let hintsService: HintsService;
    let hotkeysServiceSpy: SpyObj<HotkeysService>;
    let hintsDisplayServiceSpy: SpyObj<HintsDisplayService>;
    let gameRecorderServiceSpy: SpyObj<GameRecorderService>;
    let imageDiffServiceSpy: SpyObj<ImageDiffService>;
    const dist = { dist1: 9000, dist2: 90000, dist3: 150000, dist4: 250000 };

    beforeEach(() => {
        hotkeysServiceSpy = jasmine.createSpyObj('HotkeysService', ['hotkeysEventListener']);
        hintsDisplayServiceSpy = jasmine.createSpyObj('HintsDisplayService', ['setIcons', 'updateIcons', 'sendHintMessage', 'modifyTime']);
        gameRecorderServiceSpy = jasmine.createSpyObj('GameRecorderService', ['']);
        imageDiffServiceSpy = jasmine.createSpyObj('ImageDiffService', ['getPositionFromAbsolute']);
        TestBed.configureTestingModule({
            providers: [
                { provide: HotkeysService, useValue: hotkeysServiceSpy },
                { provide: HintsDisplayService, useValue: hintsDisplayServiceSpy },
                { provide: GameRecorderService, useValue: gameRecorderServiceSpy },
                { provide: ImageDiffService, useValue: imageDiffServiceSpy },
            ],
        });
        hintsService = TestBed.inject(HintsService);
    });

    it('should be created', () => {
        expect(hintsService).toBeTruthy();
    });

    it('hintsKeyBinding should call hotkeysService.hotkeysEventListener', () => {
        hintsService.hintsKeyBinding();
        expect(hotkeysServiceSpy.hotkeysEventListener).toHaveBeenCalled();
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
        expect(possibleQuadrant.has(3 + 1)).toBeTrue();
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
        hintsService.canvas0 = new ElementRef<HTMLCanvasElement>(document.createElement('canvas'));
        hintsService.canvas1 = new ElementRef<HTMLCanvasElement>(document.createElement('canvas'));
        const quadrant = { x: 0, y: 0, w: 320, h: 240, isInnerQuadrant: false };
        const isLastHint = false;
        spyOn(hintsService, 'displayQuadrant').and.callThrough();
        hintsService.displayQuadrant(quadrant, isLastHint);
        hintsService.color = '#000000';
        spyOn(hintsService.canvas0.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'fillRect').and.callThrough();
        spyOn(hintsService.canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D, 'fillRect').and.callThrough();
        expect(hintsService.canvas0.nativeElement.getContext('2d')?.fillStyle).toEqual(hintsService.color);
        expect(hintsService.canvas0.nativeElement.getContext('2d')?.fillRect).not.toHaveBeenCalled();
        expect(hintsService.canvas1.nativeElement.getContext('2d')?.fillStyle).toEqual(hintsService.color);
        expect(hintsService.canvas1.nativeElement.getContext('2d')?.fillRect).not.toHaveBeenCalled();
        const isLastHint2 = true;
        hintsService.displayQuadrant(quadrant, isLastHint2);
    });
});
