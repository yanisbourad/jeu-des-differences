import { ElementRef } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { DrawClearCommand } from './draw-clear-command';

describe('DrawClearCommand', () => {
    let canvasMock: ElementRef<HTMLCanvasElement>;
    let canvasElementMock: HTMLCanvasElement;
    let ctxMock: CanvasRenderingContext2D;

    beforeEach(() => {
        // Mock the canvas element and context
        canvasElementMock = document.createElement('canvas');
        ctxMock = canvasElementMock.getContext('2d') as CanvasRenderingContext2D;
        canvasMock = {
            nativeElement: canvasElementMock,
        };
    });

    it('should create an instance', () => {
        const command = new DrawClearCommand(true, canvasMock, 'test-canvas');
        expect(command).toBeTruthy();
    });

    it('should draw the image to the canvas', () => {
        const drawClearSpy = spyOn(ctxMock, 'clearRect');

        const command = new DrawClearCommand(true, canvasMock, 'test-canvas');
        command.do(false);

        expect(drawClearSpy).toHaveBeenCalled();
    });

    it('should save the old canvas data if saveForUndo is true', () => {
        const oldCanvasDataMock = 'test-canvas-data';
        spyOn(canvasElementMock, 'toDataURL').and.returnValue(oldCanvasDataMock);
        const command = new DrawClearCommand(true, canvasMock, 'test-canvas');

        const drawClearSpy = spyOn(command.ctx, 'clearRect');

        command.do(true);
        expect(drawClearSpy).toHaveBeenCalled();

        expect(command.oldCanvasData).toBe(oldCanvasDataMock);
    });

    it('should not save the old canvas data if saveForUndo is false', () => {
        const oldCanvasDataMock = 'test-canvas-data';
        spyOn(canvasElementMock, 'toDataURL').and.returnValue(oldCanvasDataMock);
        const command = new DrawClearCommand(true, canvasMock, 'test-canvas');

        const drawClearSpy = spyOn(command.ctx, 'clearRect');

        command.do(false);
        expect(drawClearSpy).toHaveBeenCalled();
        expect(command.oldCanvasData).toBeUndefined();
    });

    it('should restore the canvas to its old state', () => {
        const oldCanvasDataMock = 'test-canvas-data';
        spyOn(canvasElementMock, 'toDataURL').and.returnValue(oldCanvasDataMock);

        const drawClearSpy = spyOn(ctxMock, 'clearRect');

        const command = new DrawClearCommand(true, canvasMock, 'test-canvas');
        command.do();
        expect(command.oldCanvasData).toBe(oldCanvasDataMock);
        expect(drawClearSpy).toHaveBeenCalled();
        command.undo();
        expect(drawClearSpy).toHaveBeenCalled();
    });

    it('should not restore the canvas if oldCanvasData is undefined', () => {
        const putImageDataSpy = spyOn(ctxMock, 'putImageData');

        const command = new DrawClearCommand(false, canvasMock, 'test-canvas');
        command.undo();

        expect(putImageDataSpy).not.toHaveBeenCalled();
    });

    it('should draw the old canvas data to the canvas', fakeAsync(() => {
        const oldCanvasDataMock = 'test-canvas-data';
        spyOn(canvasElementMock, 'toDataURL').and.returnValue(oldCanvasDataMock);
        const drawFillSpy = spyOn(ctxMock, 'fillRect');

        const drawClearSpy = spyOn(ctxMock, 'clearRect');

        const command = new DrawClearCommand(false, canvasMock, 'test-canvas');
        command.do(true);
        expect(command.oldCanvasData).toBe(oldCanvasDataMock);
        expect(drawFillSpy).toHaveBeenCalled();
        command.undo();
        tick();
        expect(drawClearSpy).toHaveBeenCalled();
    }));
});
