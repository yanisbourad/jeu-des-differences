import { TestBed } from '@angular/core/testing';
import { CanvasHolderService } from './canvas-holder.service';

describe('CanvasHolderServiceService', () => {
    let service: CanvasHolderService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CanvasHolderService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return a Uint8ClampedArray', () => {
        const canvasData = new Uint8ClampedArray();
        service.setCanvas(canvasData, service.originalCanvas);
        const returnedData = service.getCanvasData(service.originalCanvas);
        expect(returnedData).toEqual(canvasData);
    });

    it('should return a string', () => {
        const canvasData = 'test';
        service.setCanvasData(canvasData, service.originalCanvas);
        const returnedData = service.getCanvasUrlData(service.originalCanvas);
        expect(returnedData).toEqual(canvasData);
    });

    it('should return a Uint8ClampedArray', () => {
        const canvasData = new Uint8ClampedArray();
        service.setCanvas(canvasData, service.modifiedCanvas);
        const returnedData = service.getCanvasData(service.modifiedCanvas);
        expect(returnedData).toEqual(canvasData);
    });

    it('should return a string', () => {
        const canvasData = 'test';
        service.setCanvasData(canvasData, service.modifiedCanvas);
        const returnedData = service.getCanvasUrlData(service.modifiedCanvas);
        expect(returnedData).toEqual(canvasData);
    });

    it('should throw an error if we ask for other canvas then original or modifierd', () => {
        const canvasDataUrl = 'test';
        const canvasData = new Uint8ClampedArray();
        expect(() => service.getCanvasData('test')).toThrowError('Canvas name not found');
        expect(() => service.setCanvas(canvasData, 'test')).toThrowError('Canvas name not found');
        expect(() => service.setCanvasData(canvasDataUrl, 'test')).toThrowError('Canvas name not found');
        expect(() => service.getCanvasUrlData('test')).toThrowError('Canvas name not found');
    });

    it('should clear the canvas', () => {
        const canvasDataUrl = 'test';
        const canvasData = new Uint8ClampedArray();
        service.setCanvas(canvasData, service.modifiedCanvas);
        service.setCanvasData(canvasDataUrl, service.modifiedCanvas);
        service.setCanvas(canvasData, service.originalCanvas);
        service.setCanvasData(canvasDataUrl, service.originalCanvas);
        service.clearCanvas();
        expect(service.getCanvasData(service.modifiedCanvas)).toEqual(new Uint8ClampedArray());
        expect(service.getCanvasUrlData(service.modifiedCanvas)).toEqual('');
        expect(service.getCanvasData(service.originalCanvas)).toEqual(new Uint8ClampedArray());
        expect(service.getCanvasUrlData(service.originalCanvas)).toEqual('');
    });
});
