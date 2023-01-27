import { TestBed } from '@angular/core/testing';
import * as constants from '@app/configuration/const-canvas';
import { Point } from '@app/interfaces/point';
import { DrawService } from './draw.service';

describe('DrawService', () => {
    let service: DrawService;
    let canvas: HTMLCanvasElement;
    let point: Point;
    let lastPoint: Point;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawService);
        canvas = document.createElement('canvas');
        point = { x: 50, y: 50 };
        lastPoint = { x: 25, y: 25 };
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
        service.setLineWidth = 5;
        expect(service.getLineWidth).toBe(5);
    });
    // TODO: fix this test with a real image
    it('should not draw an image on the canvas if empty', () => {
        const image = new ImageBitmap();
        service.drawImage(image, canvas);
    });

    it('should draw a line on the canvas', () => {
        service.drawVec(point, lastPoint, canvas);
    });

    it('should clear the canvas', () => {
        service.drawVec(point, lastPoint, canvas);
        service.clearCanvas(canvas);
    });

    it('should validate drawing', () => {
        const selectedRadius = 5;
        expect(service.validateDrawing(selectedRadius)).toBe(true);
    });
});
