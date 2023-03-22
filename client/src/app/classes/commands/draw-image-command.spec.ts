import { ElementRef } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { DrawImageCommand } from './draw-image-command';

describe('DrawImageCommand', () => {
    let canvasMock: ElementRef<HTMLCanvasElement>;
    let canvasElementMock: HTMLCanvasElement;
    let ctxMock: CanvasRenderingContext2D;
    let imageMock: ImageBitmap;

    beforeEach(() => {
        // Mock the canvas element and context
        canvasElementMock = document.createElement('canvas');
        ctxMock = canvasElementMock.getContext('2d') as CanvasRenderingContext2D;
        canvasMock = {
            nativeElement: canvasElementMock,
        };

        const xhr = new XMLHttpRequest();
        xhr.open('GET', './assets/image_empty.bmp');
        xhr.responseType = 'blob';
        xhr.onload = () => {
            const blob = xhr.response;
            createImageBitmap(blob).then((bmp) => {
                imageMock = bmp;
            });
        };
        xhr.send();
    });

    it('should create an instance', () => {
        const command = new DrawImageCommand(imageMock, canvasMock, 'test-canvas');
        expect(command).toBeTruthy();
    });

    it('should draw the image to the canvas', () => {
        const drawImageSpy = spyOn(ctxMock, 'drawImage');

        const command = new DrawImageCommand(imageMock, canvasMock, 'test-canvas');
        command.do(false);

        expect(drawImageSpy).toHaveBeenCalled();
    });

    it('should save the old canvas data if saveForUndo is true', () => {
        const oldCanvasDataMock = 'test-canvas-data';
        spyOn(canvasElementMock, 'toDataURL').and.returnValue(oldCanvasDataMock);
        const command = new DrawImageCommand(imageMock, canvasMock, 'test-canvas');

        const spyDrawImage = spyOn(command.ctx, 'drawImage');

        command.do(true);
        expect(spyDrawImage).toHaveBeenCalled();

        expect(command.oldCanvasData).toBe(oldCanvasDataMock);
    });

    it('should not save the old canvas data if saveForUndo is false', () => {
        const oldCanvasDataMock = 'test-canvas-data';
        spyOn(canvasElementMock, 'toDataURL').and.returnValue(oldCanvasDataMock);
        const command = new DrawImageCommand(imageMock, canvasMock, 'test-canvas');

        const spyDrawImage = spyOn(command.ctx, 'drawImage');

        command.do(false);
        expect(spyDrawImage).toHaveBeenCalled();
        expect(command.oldCanvasData).toBeUndefined();
    });

    it('should restore the canvas to its old state', () => {
        const oldCanvasDataMock = 'test-canvas-data';
        spyOn(canvasElementMock, 'toDataURL').and.returnValue(oldCanvasDataMock);

        const drawImageSpy = spyOn(ctxMock, 'drawImage');

        const command = new DrawImageCommand(imageMock, canvasMock, 'test-canvas');
        command.do();
        expect(command.oldCanvasData).toBe(oldCanvasDataMock);
        expect(drawImageSpy).toHaveBeenCalled();
        command.undo();
        expect(drawImageSpy).toHaveBeenCalled();
    });

    it('should not restore the canvas if oldCanvasData is undefined', () => {
        const drawImageSpy = spyOn(ctxMock, 'drawImage');

        const command = new DrawImageCommand(imageMock, canvasMock, 'test-canvas');
        command.undo();

        expect(drawImageSpy).not.toHaveBeenCalled();
    });

    it('should draw the old canvas data to the canvas', fakeAsync(() => {
        const oldCanvasDataMock = 'test-canvas-data';
        spyOn(canvasElementMock, 'toDataURL').and.returnValue(oldCanvasDataMock);

        const drawImageSpy = spyOn(ctxMock, 'drawImage');

        const command = new DrawImageCommand(imageMock, canvasMock, 'test-canvas');
        command.do(true);
        expect(command.oldCanvasData).toBe(oldCanvasDataMock);
        expect(drawImageSpy).toHaveBeenCalled();
        command.undo();
        tick();
        expect(drawImageSpy).toHaveBeenCalled();
    }));
});
