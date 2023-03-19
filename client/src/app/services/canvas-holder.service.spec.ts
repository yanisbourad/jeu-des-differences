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
        const returnedData = service.getCanvasData(service.originalCanvas);
        expect(returnedData).toEqual(canvasData);
    });

    it('should return a string', () => {
        const canvasData = 'test';
        const returnedData = service.getCanvasUrlData(service.originalCanvas);
        expect(returnedData).toEqual(canvasData);
    });

    it('should return a Uint8ClampedArray', () => {
        const canvasData = new Uint8ClampedArray();
        const returnedData = service.getCanvasData(service.modifiedCanvas);
        expect(returnedData).toEqual(canvasData);
    });

    it('should return a string', () => {
        const canvasData = 'test';
        const returnedData = service.getCanvasUrlData(service.modifiedCanvas);
        expect(returnedData).toEqual(canvasData);
    });

    it('should throw an error if we ask for other canvas then original or modifierd', () => {
        expect(() => service.getCanvasData('test')).toThrowError('Canvas name not found');
        expect(() => service.getCanvasUrlData('test')).toThrowError('Canvas name not found');
    });

    it('should clear the canvas', () => {
        expect(service.getCanvasData(service.modifiedCanvas)).toEqual(new Uint8ClampedArray());
        expect(service.getCanvasUrlData(service.modifiedCanvas)).toEqual('');
        expect(service.getCanvasData(service.originalCanvas)).toEqual(new Uint8ClampedArray());
        expect(service.getCanvasUrlData(service.originalCanvas)).toEqual('');
    });
});
