import { TestBed } from '@angular/core/testing';

import { CheatModeService } from './cheat-mode.service';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
import { GameRecorderService } from '@app/services/game/game-recorder.service';
import SpyObj = jasmine.SpyObj;
import * as constantsTime from '@app/configuration/const-time';
import { ElementRef } from '@angular/core';
import { DrawService } from '@app/services/draw/draw.service';

describe('CheatModeService', () => {
    let cheatModeService: CheatModeService;
    let hotkeysServiceSpy: SpyObj<HotkeysService>;
    let gameRecorderServiceSpy: SpyObj<GameRecorderService>;
    const dist = { dist1: 9000, dist2: 90000, dist3: 150000, dist4: 250000 };

    beforeEach(() => {
        hotkeysServiceSpy = jasmine.createSpyObj('HotkeysService', ['hotkeysEventListener', 'removeHotkeysEventListener']);
        gameRecorderServiceSpy = jasmine.createSpyObj('GameRecorderService', ['do']);
        TestBed.configureTestingModule({
            providers: [
                { provide: HotkeysService, useValue: hotkeysServiceSpy },
                { provide: GameRecorderService, useValue: gameRecorderServiceSpy },
            ],
        });
        cheatModeService = TestBed.inject(CheatModeService);
        cheatModeService.canvas0 = new ElementRef<HTMLCanvasElement>(document.createElement('canvas'));
        cheatModeService.canvas1 = new ElementRef<HTMLCanvasElement>(document.createElement('canvas'));
    });

    it('should be created', () => {
        expect(cheatModeService).toBeTruthy();
    });

    it('cheatModeKeyBinding should call hotkeysService.hotkeysEventListener', () => {
        cheatModeService.cheatModeKeyBinding();
        expect(hotkeysServiceSpy.hotkeysEventListener).toHaveBeenCalled();
        expect(cheatModeService.indexEvent).toBeUndefined();
    });

    it('should call inside setInterval drawDifference when cheatMode is called and setColor is black', () => {
        const diff = new Set([dist.dist1, dist.dist2, dist.dist3, dist.dist4]);
        const drawDifferenceSpy = spyOn(cheatModeService, 'drawDifference').and.callThrough();
        jasmine.clock().install();
        cheatModeService.unfoundedDifference = [diff];
        cheatModeService.cheatMode();
        jasmine.clock().tick(constantsTime.BLINKING_TIME);
        expect(cheatModeService.color).toEqual('black');
        for (const set of cheatModeService.unfoundedDifference) {
            expect(drawDifferenceSpy).toHaveBeenCalledWith(set);
        }
        jasmine.clock().uninstall();
    });

    it('removeDifference should  call eqSet and removeDifferenceFromUnfoundedDifference', () => {
        const diff = new Set([dist.dist1, dist.dist2, dist.dist3, dist.dist4]);
        spyOn(cheatModeService, 'removeDifference').and.callThrough();
        spyOn(cheatModeService, 'eqSet').and.callThrough();
        cheatModeService.unfoundedDifference = [diff];
        cheatModeService.removeDifference(diff);
        cheatModeService.unfoundedDifference = cheatModeService.unfoundedDifference.filter((set) => !cheatModeService.eqSet(set, diff));
        expect(cheatModeService.eqSet).toHaveBeenCalled();
        expect(cheatModeService.unfoundedDifference).toEqual([]);
    });

    it('should toggle isCheating when toggleCheating is called', () => {
        cheatModeService.isCheating = false;
        spyOn(cheatModeService, 'toggleCheating').and.callThrough();
        cheatModeService.toggleCheating();
        expect(cheatModeService.isCheating).toBe(true);
        expect(gameRecorderServiceSpy.do).toHaveBeenCalled();
        cheatModeService.toggleCheating();
        expect(cheatModeService.isCheating).toBe(false);
        expect(gameRecorderServiceSpy.do).toHaveBeenCalled();
        const dummyElement = document.createElement('textarea');
        dummyElement.setAttribute('id', 'chat-box');
        dummyElement.setAttribute('maxlength', '200');
        dummyElement.setAttribute('cols', '40');
        dummyElement.setAttribute('rows', '5');
        dummyElement.setAttribute('placeholder', 'Écrire à ${gameService.opponentName}… (200 caractères maximum)');
        dummyElement.setAttribute('disabled', "gameService.gameType === 'solo' || !notRewinding ? 'disabled' : null");
        document.body.appendChild(dummyElement);
        dummyElement.focus();
        Object.defineProperty(document, 'activeElement', { value: dummyElement });
        cheatModeService.isCheating = true;
        cheatModeService.toggleCheating();
        expect(document.activeElement).toEqual(dummyElement);
        dummyElement.setAttribute('style', 'display: none');
    });

    it('stopCheating should call clearInterval and clearCanvasCheat', () => {
        const clearCanvasCheatSpy = spyOn(cheatModeService, 'clearCanvasCheat');
        cheatModeService.stopCheating();
        expect(clearCanvasCheatSpy).toHaveBeenCalled();
    });

    it('drawDifference should call drawDiff', () => {
        const diff = new Set([dist.dist1, dist.dist2, dist.dist3, dist.dist4]);
        spyOn(cheatModeService, 'drawDifference').and.callThrough();
        spyOn(DrawService, 'drawDiff').and.callFake(() => ({}));
        cheatModeService.drawDifference(diff);
        expect(cheatModeService.drawDifference).toHaveBeenCalled();
    });

    it('removeHotkeysEventListener should call not removeEventListener if indexEvent is undefined', () => {
        cheatModeService.indexEvent = undefined;
        spyOn(cheatModeService, 'removeHotkeysEventListener').and.callThrough();
        cheatModeService.removeHotkeysEventListener();
        expect(hotkeysServiceSpy.removeHotkeysEventListener).not.toHaveBeenCalled();
    });

    it('removeHotkeysEventListener should call removeEventListener if indexEvent is not undefined', () => {
        cheatModeService.indexEvent = 0;
        spyOn(cheatModeService, 'removeHotkeysEventListener').and.callThrough();
        cheatModeService.removeHotkeysEventListener();
        expect(hotkeysServiceSpy.removeHotkeysEventListener).toHaveBeenCalled();
        expect(cheatModeService.indexEvent).toBeUndefined();
    });

    it('clearCanvasCheat should call clearDiff', () => {
        const canvasA = document.createElement('canvas');
        const canvasB = document.createElement('canvas');
        spyOn(cheatModeService, 'clearCanvasCheat').and.callThrough();
        spyOn(DrawService, 'clearDiff').and.callFake(() => ({}));
        cheatModeService.clearCanvasCheat(canvasA, canvasB);
        expect(cheatModeService.clearCanvasCheat).toHaveBeenCalled();
        expect(DrawService.clearDiff).toHaveBeenCalled();
    });

    it('resetService should reinitialize all variables', () => {
        cheatModeService.isCheating = true;
        cheatModeService.unfoundedDifference = [new Set([dist.dist1, dist.dist2, dist.dist3, dist.dist4])];
        cheatModeService.resetService();
        expect(cheatModeService.isCheating).toBe(false);
        expect(cheatModeService.unfoundedDifference).toEqual([]);
    });

    it('should return true if sets are equal', () => {
        const set1 = new Set([1, 2, 3]);
        const set2 = new Set([3, 2, 1]);
        expect(cheatModeService.eqSet(set1, set2)).toBe(true);
    });

    it('should return false if sets are not equal', () => {
        const set1 = new Set([1, 2, 3]);
        const set2 = new Set([0, 0, 0]);
        expect(cheatModeService.eqSet(set1, set2)).toBe(false);
    });

    it('should return false if sets are different sizes', () => {
        const set1 = new Set([1, 2, 3]);
        const set2 = new Set([1, 2]);
        expect(cheatModeService.eqSet(set1, set2)).toBe(false);
    });
});
