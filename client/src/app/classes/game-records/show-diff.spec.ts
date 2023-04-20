import { ElementRef } from '@angular/core';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { DrawService } from '@app/services/draw/draw.service';
import { of } from 'rxjs';
import { ShowDiffRecord } from './show-diff';

describe('ShowDiffRecord', () => {
    let canvas1: ElementRef<HTMLCanvasElement>;
    let canvas2: ElementRef<HTMLCanvasElement>;
    let canvas0: ElementRef<HTMLCanvasElement>;
    let canvas3: ElementRef<HTMLCanvasElement>;
    let canvasImageModifier: HTMLCanvasElement;
    let component: GamePageComponent;
    let showDiffRecord: ShowDiffRecord;

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
        DrawService.getImageDateFromDataUrl = jasmine.createSpy().and.returnValue(of({} as ImageData));

        showDiffRecord = new ShowDiffRecord(new Set([1, 2]), { canvas1, canvas2, canvas0, canvas3 }, true, { x: 0, y: 0 });
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
        DrawService.drawDiff = jasmine.createSpy();
        showDiffRecord.drawDifference(new Set([1, 2]), { canvas1, canvas2 }, {} as ImageData, canvasImageModifier);
        expect(DrawService.drawDiff).toHaveBeenCalled();
    });

    it('should test the case when the difference is not found by me', () => {
        showDiffRecord = new ShowDiffRecord(new Set([1, 2]), { canvas1, canvas2 });
        showDiffRecord.drawDifference = jasmine.createSpy();
        component.gameService.handlePlayerDifference = jasmine.createSpy();
        showDiffRecord.do(component);
        expect(component.gameService.handlePlayerDifference).toHaveBeenCalled();
    });
});
