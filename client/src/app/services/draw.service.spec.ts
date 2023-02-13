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
        xhr.onload = () => {
            const blob = xhr.response;
            createImageBitmap(blob).then((bmp) => {
                image = bmp;
            });
        };
        xhr.send();
    });

    it('should create an instance', () => {
        expect(service).toBeTruthy();
    });

    it('should set the canvas size', () => {
        expect(service.width).toBe(constants.defaultWidth);
        expect(service.height).toBe(constants.defaultHeight);
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

    it('should draw an image on the canvas', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(canvas.getContext('2d'), 'drawImage');
        service.drawImage(image, canvas);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledOnceWith(image, 0, 0, constants.defaultWidth, constants.defaultHeight);
    });

    it('should draw an image on multiple canvas', () => {
        // read the image file as a data URL
        const spy = spyOn(service, 'drawImage');
        service.drawImageOnMultipleCanvas(image, canvas, canvas);
        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalledWith(image, canvas);
        expect(spy).toHaveBeenCalledWith(image, canvas);
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
});
