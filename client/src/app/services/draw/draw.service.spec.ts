import { TestBed } from '@angular/core/testing';
import * as constants from '@app/configuration/const-canvas';
import { Vec2 } from '@app/interfaces/vec2';
import { DrawService } from './draw.service';
describe('DrawService', () => {
    let service: DrawService;
    let canvas: HTMLCanvasElement;
    let image: ImageBitmap;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawService);
        canvas = document.createElement('canvas');

        // read the image file as a data URL
        const xhr = new XMLHttpRequest();
        xhr.open('GET', './assets/image_empty.bmp');
        xhr.responseType = 'blob';
        if (!image) {
            xhr.onload = () => {
                const blob = xhr.response;
                createImageBitmap(blob).then((bmp) => {
                    image = bmp;
                });
            };
            xhr.send();
        }
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
        const context = service.getContext(canvas);
        expect(context).toBeTruthy();
    });

    it('should draw all differences', () => {
        const spy = spyOn(service, 'drawDiff');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const listDiff = [new Set([1, 2, 3, 4])];
        service.drawAllDiff(listDiff, canvas);
        expect(spy).toHaveBeenCalledOnceWith(listDiff[0], canvas);
    });

    it('should draw a difference', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(canvas.getContext('2d'), 'fillRect');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const diff = new Set([1, 2, 3, 4]);
        service.drawDiff(diff, canvas);
        expect(spy).toHaveBeenCalledTimes(diff.size);
    });

    it('should clear the canvas', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(canvas.getContext('2d'), 'fillRect');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service.clearCanvas(canvas);
        expect(spy).toHaveBeenCalledOnceWith(0, 0, service.width, service.height);
    });

    it('should clear the difference', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(canvas.getContext('2d'), 'clearRect');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service.clearDiff(canvas);
        expect(spy).toHaveBeenCalledOnceWith(0, 0, service.width, service.height);
    });

    it('should draw a word', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(canvas.getContext('2d'), 'fillText');
        const position: Vec2 = { x: 0, y: 0 };
        service.drawWord('test', canvas, position);
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
});
