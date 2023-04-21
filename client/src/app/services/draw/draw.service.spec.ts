import { TestBed } from '@angular/core/testing';
import * as constants from '@app/configuration/const-canvas';
import { Vec2 } from '@app/interfaces/vec2';
import { DrawService } from './draw.service';
describe('DrawService', async () => {
    let service: DrawService;
    let canvas: HTMLCanvasElement;
    let image: ImageBitmap;
    const timeOut = 500;
    const diff = new Set([1, 2, 3, 3]);
    beforeAll((done) => {
        // read the image file as a data URL
        const xhr = new XMLHttpRequest();
        xhr.open('GET', './assets/image_empty.bmp');
        xhr.responseType = 'blob';
        xhr.onload = () => {
            const blob = xhr.response;
            createImageBitmap(blob).then((bmp) => {
                image = bmp;
                done();
            });
        };
        xhr.send();
    });

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawService);
        canvas = document.createElement('canvas');
    });

    it('should create an instance', () => {
        expect(service).toBeTruthy();
    });

    it('should set the canvas size', () => {
        expect(service.width).toBe(constants.DEFAULT_WIDTH);
        expect(service.height).toBe(constants.DEFAULT_HEIGHT);
    });

    it('should set the color', () => {
        service.setColor = 'red';
        expect(service.getColor).toBe('red');
    });

    it('should set the line width', () => {
        service.setLineWidth = 0;
        expect(service.getLineWidth).toBe(0);
    });

    it('should get the context', () => {
        const context = DrawService.getContext(canvas);
        expect(context).toBeTruthy();
    });

    it('should draw all differences', () => {
        const spy = spyOn(DrawService, 'drawDiff');
        DrawService.drawAllDiff([diff], canvas);
        expect(spy).toHaveBeenCalledOnceWith(diff, canvas);
    });

    it('should draw the same part of the image', async () => {
        const thisCanvas = document.createElement('canvas');
        thisCanvas.width = constants.DEFAULT_WIDTH;
        thisCanvas.height = constants.DEFAULT_HEIGHT;
        const context = thisCanvas.getContext('2d') as CanvasRenderingContext2D;
        context.drawImage(image, 0, 0);
        const spy = spyOn(DrawService.getContext(thisCanvas), 'fillRect');
        const data = await context.getImageData(0, 0, constants.DEFAULT_WIDTH, constants.DEFAULT_HEIGHT);
        DrawService.drawDiff(diff, thisCanvas, '', data);
        expect(spy).toHaveBeenCalledTimes(diff.size);
    });

    it('should draw a difference', () => {
        // we need to use 'any' to be able to implement the spy
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(canvas.getContext('2d'), 'fillRect');
        DrawService.drawDiff(diff, canvas);
        expect(spy).toHaveBeenCalledTimes(diff.size);
    });

    it('should clear the canvas', () => {
        // we need to use 'any' to be able to implement the spy
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(canvas.getContext('2d'), 'fillRect');
        DrawService.clearCanvas(canvas);
        expect(spy).toHaveBeenCalledOnceWith(0, 0, service.width, service.height);
    });

    it('should clear the difference', () => {
        // we need to use 'any' to be able to implement the spy
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(canvas.getContext('2d'), 'clearRect');
        DrawService.clearDiff(canvas);
        expect(spy).toHaveBeenCalledOnceWith(0, 0, service.width, service.height);
    });

    it('should draw a word', () => {
        // we need to use 'any' to be able to implement the spy
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(canvas.getContext('2d'), 'fillText');
        const position: Vec2 = { x: 0, y: 0 };
        DrawService.drawWord('test', canvas, position);
        expect(spy).toHaveBeenCalledOnceWith('test', 0, 0);
    });

    it('should return the same tool as set tool', () => {
        service.setTool = 'test';
        expect(service.usedTool).toEqual('test');
    });

    it('should set the square toggle normally', () => {
        // initial value is false
        expect(service.getRectangleIsSquare).toEqual(false);

        // set to true
        service.setIsSquare();
        expect(service.getRectangleIsSquare).toEqual(true);
        // set to true

        service.setIsRectangle();
        expect(service.getRectangleIsSquare).toEqual(false);
    });

    it('should translate the image dataUrl to ImageData', (done) => {
        const thisCanvas = document.createElement('canvas');
        thisCanvas.width = constants.DEFAULT_WIDTH;
        thisCanvas.height = constants.DEFAULT_HEIGHT;
        const context = thisCanvas.getContext('2d') as CanvasRenderingContext2D;
        context.drawImage(image, 0, 0);
        const imageData = thisCanvas.toDataURL('image/png');
        expect(imageData).toBeTruthy();
        DrawService.getImageDateFromDataUrl(imageData).subscribe((data) => {
            expect(data).toBeTruthy();
            expect(data.width).toEqual(constants.DEFAULT_WIDTH);
            expect(data.height).toEqual(constants.DEFAULT_HEIGHT);
            expect(data).toEqual(context.getImageData(0, 0, constants.DEFAULT_WIDTH, constants.DEFAULT_HEIGHT));
            done();
        });
    });

    it('should draw the imageData on canvas', async () => {
        const thisCanvas = document.createElement('canvas');
        thisCanvas.width = constants.DEFAULT_WIDTH;
        thisCanvas.height = constants.DEFAULT_HEIGHT;
        const context = thisCanvas.getContext('2d') as CanvasRenderingContext2D;
        try {
            context.drawImage(image, 0, 0);
        } catch (e) {
            // wait for the image to be loaded
            await new Promise((f) => setTimeout(f, timeOut));
            context.drawImage(image, 0, 0);
        }
        const imageDataUrl = thisCanvas.toDataURL('image/png');
        const imageDate: ImageData = context.getImageData(0, 0, constants.DEFAULT_WIDTH, constants.DEFAULT_HEIGHT);
        DrawService.drawImage(imageDate, thisCanvas);
        expect(imageDataUrl).toEqual(thisCanvas.toDataURL('image/png'));
    });
});
