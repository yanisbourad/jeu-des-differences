import { ElementRef, EventEmitter } from '@angular/core';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { DrawService } from '@app/services/draw/draw.service';
import { ShowDiffRecord } from './show-diff';

describe('ShowDiffRecord', () => {
    let canvas1: ElementRef<HTMLCanvasElement>;
    let canvas2: ElementRef<HTMLCanvasElement>;
    let canvas0: ElementRef<HTMLCanvasElement>;
    let canvas3: ElementRef<HTMLCanvasElement>;
    let canvasImageModifier: HTMLCanvasElement;
    let component: GamePageComponent;
    let showDiffRecord: ShowDiffRecord;
    // let getImageDateFromDataUrl: (dataUrl: string) => EventEmitter<ImageData>;
    beforeEach(() => {
        canvas1 = { nativeElement: document.createElement('canvas') };
        canvas2 = { nativeElement: document.createElement('canvas') };
        canvas0 = { nativeElement: document.createElement('canvas') };
        canvas3 = { nativeElement: document.createElement('canvas') };
        canvasImageModifier = document.createElement('canvas');

        component = {
            cheatModeService: { removeDifference: jasmine.createSpy() },
            gameService: {
                reduceNbrDifferences: jasmine.createSpy(),
                handlePlayerDifference: jasmine.createSpy(),
                defineVariables: jasmine.createSpy(),
                displayIcons: jasmine.createSpy(),
                iconsUpdateForTimeLimit: jasmine.createSpy(),
                mode: true,
                game: { originalImageData: '' },
            },
            hintsService: { removeDifference: jasmine.createSpy() },
            getCanvasImageModifier: canvasImageModifier,
        } as unknown as GamePageComponent;
        // getImageDateFromDataUrl = DrawService.getImageDateFromDataUrl.bind(DrawService);
        // DrawService.getImageDateFromDataUrl = jasmine.createSpy().and.returnValue(of({} as ImageData));

        showDiffRecord = new ShowDiffRecord(new Set([1, 2]), { canvas1, canvas2, canvas0, canvas3 }, true, { x: 0, y: 0 });
    });
    afterAll(() => {
        // DrawService.getImageDateFromDataUrl = getImageDateFromDataUrl;
    });

    it('should call showMessage, reduceNbrDifferences and displayWord when isMeWhoFound is true', () => {
        showDiffRecord.drawDifference = jasmine.createSpy();
        showDiffRecord.do(component);
        expect(component.gameService.reduceNbrDifferences).toHaveBeenCalled();
    });

    it('should call handlePlayerDifference when isMeWhoFound is false', () => {
        showDiffRecord.drawDifference = jasmine.createSpy();
        showDiffRecord.isMeWhoFound = false;
        showDiffRecord.do(component);
        expect(component.gameService.handlePlayerDifference).toHaveBeenCalled();
    });

    it('should call clearCanvas when mode is true', () => {
        showDiffRecord.drawDifference = jasmine.createSpy();
        showDiffRecord.do(component);
        expect(component.gameService.defineVariables).toHaveBeenCalled();
        expect(component.gameService.displayIcons).toHaveBeenCalled();
        expect(component.gameService.iconsUpdateForTimeLimit).toHaveBeenCalled();
    });

    it('should call removeDifference for cheatModeService and hintsService', () => {
        showDiffRecord.drawDifference = jasmine.createSpy();
        showDiffRecord.do(component);
        expect(component.cheatModeService.removeDifference).toHaveBeenCalledWith(new Set([1, 2]));
        expect(component.hintsService.removeDifference).toHaveBeenCalledWith(new Set([1, 2]));
    });

    it('should draw difference', () => {
        const spy = spyOn(DrawService, 'drawDiff').and.callFake(() => {
            // expect the function to be called
            expect(true).toBe(true);
        });
        showDiffRecord.drawDifference({ diff: new Set([1, 2]), canvas: { canvas1, canvas2 }, originalImage: {} as ImageData, canvasImageModifier });
        expect(DrawService.drawDiff).toHaveBeenCalled();
        spy.and.callThrough();
    });

    it('should test the case when the difference is not found by me', () => {
        showDiffRecord = new ShowDiffRecord(new Set([1, 2]), { canvas1, canvas2 });
        const obs: EventEmitter<ImageData> = new EventEmitter<ImageData>();
        const spyGetter = spyOn(DrawService, 'getImageDateFromDataUrl').and.callFake(() => {
            return obs;
        });
        const spy = spyOn(showDiffRecord, 'drawDifference').and.callFake(() => {
            // expect the function is called
            expect(true).toBe(true);
        });
        component.gameService.handlePlayerDifference = jasmine.createSpy();
        showDiffRecord.do(component);
        obs.emit({} as ImageData);
        expect(component.gameService.handlePlayerDifference).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
        expect(spyGetter).toHaveBeenCalled();

        spy.and.callThrough();
        spyGetter.and.callThrough();
    });
});
