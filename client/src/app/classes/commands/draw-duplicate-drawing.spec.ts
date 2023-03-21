import { ElementRef } from '@angular/core';
import { DrawDuplicateDrawing } from './draw-duplicate-drawing';

describe('DrawDuplicateDrawing', () => {
    let canvasOld: ElementRef<HTMLCanvasElement>;
    let canvasNew: ElementRef<HTMLCanvasElement>;
    let canvasName: string;
    let command: DrawDuplicateDrawing;

    beforeEach(() => {
        // set up canvas elements and name
        canvasOld = { nativeElement: document.createElement('canvas') };
        canvasNew = { nativeElement: document.createElement('canvas') };
        canvasName = 'testCanvas';

        // create command instance
        command = new DrawDuplicateDrawing(canvasOld, canvasNew, canvasName);
    });

    it('should initialize with correct canvas data', () => {
        // check that oldCanvasData was set correctly
        expect(command.canvasOld).toBeTruthy();
    });

    it('should duplicate drawing onto new canvas', () => {
        // create a sample image data
        const sampleImageData =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA' +
            'AAAGCAIAAAD8GO2jAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAJ0lEQVQI12P4//8/AAX+' +
            'Av7czFnnAAAAAElFTkSuQmCC';

        // set old canvas data to sample image data
        command.oldCanvasData = sampleImageData;

        // call do() method to duplicate drawing onto new canvas
        const spy = spyOn(command, 'putsCanvasData');

        command.do(true);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should save previous canvas data on do()', () => {
        // create a sample image data
        const sampleImageData =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA' +
            'AAAGCAIAAAD8GO2jAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAJ0lEQVQI12P4//8/AAX+' +
            'Av7czFnnAAAAAElFTkSuQmCC';

        // set old canvas data to sample image data
        command.oldCanvasData = sampleImageData;

        // call do() method to duplicate drawing onto new canvas and save previous canvas data
        command.do(true);

        // check that previousCanvasData was set correctly
        expect(command.previousCanvasData).toBeTruthy();
    });

    it('should undo previous drawing', () => {
        // create a sample image data
        const sampleImageData1 =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA' +
            'AAAGCAIAAAD8GO2jAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAJ0lEQVQI12P4//8/AAX+' +
            'Av7czFnnAAAAAElFTkSuQmCC';
        // create a sample image data to duplicate
        const sampleImageData2 =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA' +
            'AAAGCAIAAAD8GO2jAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAJ0lEQVQI12P4//8/AAX+' +
            'Av7czFnnAAAAAElFTkSuQmCC';

        // create old and new canvas elements
        const oldCanvas: ElementRef<HTMLCanvasElement> = {
            nativeElement: document.createElement('canvas'),
        };
        const newCanvas: ElementRef<HTMLCanvasElement> = {
            nativeElement: document.createElement('canvas'),
        };

        // set up old canvas element with sample image data
        const oldCanvasCtx = oldCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const oldImage = new Image();
        oldImage.src = sampleImageData1;
        oldImage.onload = () => {
            oldCanvas.nativeElement.width = oldImage.width;
            oldCanvas.nativeElement.height = oldImage.height;
            oldCanvasCtx.drawImage(oldImage, 0, 0);
        };

        // set up new canvas element with different sample image data
        const newCanvasCtx = newCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const newImage = new Image();
        newImage.src = sampleImageData2;
        newImage.onload = () => {
            newCanvas.nativeElement.width = newImage.width;
            newCanvas.nativeElement.height = newImage.height;
            newCanvasCtx.drawImage(newImage, 0, 0);
        };

        // create DrawDuplicateDrawing object and execute do()
        const drawDuplicateDrawing = new DrawDuplicateDrawing(oldCanvas, newCanvas, 'test canvas');
        drawDuplicateDrawing.do(true);

        // ensure the canvas data matches the old canvas data
        const oldImageData = oldCanvasCtx.getImageData(0, 0, oldCanvas.nativeElement.width, oldCanvas.nativeElement.height);
        const newImageData = newCanvasCtx.getImageData(0, 0, newCanvas.nativeElement.width, newCanvas.nativeElement.height);
        expect(newImageData.data).toEqual(oldImageData.data);

        // execute undo() and ensure the canvas data matches the new canvas data
        drawDuplicateDrawing.undo();
        const newImageDataAfterUndo = newCanvasCtx.getImageData(0, 0, newCanvas.nativeElement.width, newCanvas.nativeElement.height);
        expect(newImageDataAfterUndo.data).toEqual(newImageData.data);
    });
});
