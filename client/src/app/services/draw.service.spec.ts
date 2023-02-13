import { TestBed } from '@angular/core/testing';
import * as constants from '@app/configuration/const-canvas';
import { DrawService } from './draw.service';
describe('DrawService', () => {
    let service: DrawService;
    let canvas: HTMLCanvasElement;

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
        const context = service.getContext(canvas);
        expect(context).toBeTruthy();
    });

    it('should draw an image on the canvas', () => {
        // read the image file as a data URL
        const xhr = new XMLHttpRequest();
        xhr.open('GET', './assets/image_empty.bmp');
        xhr.responseType = 'blob';
        xhr.onload = () => {
            const blob = xhr.response;
            createImageBitmap(blob).then((bmp) => {
                const spy = spyOn(service, 'getContext');
                service.drawImage(bmp, canvas);
                expect(bmp).toBeTruthy();
                const canvas2 = document.createElement('canvas').getContext('2d');
                canvas2?.drawImage(bmp, 0, 0, constants.DEFAULT_WIDTH, constants.DEFAULT_HEIGHT);
                expect(canvas2?.getImageData(0, 0, constants.DEFAULT_WIDTH, constants.DEFAULT_HEIGHT)).toEqual(
                    canvas.getContext('2d')?.getImageData(0, 0, constants.DEFAULT_WIDTH, constants.DEFAULT_HEIGHT),
                );
                expect(spy).toHaveBeenCalled();
            });
        };
        xhr.send();
    });

    it('should draw an image on multiple canvas', () => {
        // read the image file as a data URL
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'assets/image_empty.bmp');
        xhr.responseType = 'blob';
        xhr.onload = () => {
            const blob = xhr.response;
            createImageBitmap(blob).then((bmp) => {
                const spy = spyOn(service, 'drawImage');
                // const canvas2 = document.createElement('canvas');
                // create a new canvas element
                const canvas2 = document.createElement('canvas');
                service.drawImageOnMultipleCanvas(bmp, canvas, canvas2);
                canvas.toDataURL();
                expect(canvas.toDataURL()).toEqual(canvas2.toDataURL());
                expect(spy).toHaveBeenCalled();
            });
        };
        xhr.send();
    });

    it('should draw all differences', () => {
        const spy = spyOn(service, 'drawDiff');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const listDiff = [new Set([1, 2, 3, 4])];
        service.drawAllDiff(listDiff, canvas);
        expect(spy).toHaveBeenCalledOnceWith(listDiff[0], canvas);
    });

    it('should draw a difference', () => {
        const spy = spyOn(service, 'getContext');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const diff = new Set([1, 2, 3, 4]);
        service.clearCanvas(canvas);
        service.drawDiff(diff, canvas);
        expect(spy).toHaveBeenCalledOnceWith(canvas);
        expect(true).toBeTruthy();
    });
});
