import { TestBed } from '@angular/core/testing';
import { CanvasNgxComponent } from '@app/components/canvas-ngx/canvas-ngx.component';
import { CanvasHolderService } from './canvas-holder.service';

describe('CanvasHolderService', () => {
    let service: CanvasHolderService;
    let canvas: jasmine.SpyObj<CanvasNgxComponent>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CanvasHolderService],
        });
        service = TestBed.inject(CanvasHolderService);
        canvas = jasmine.createSpyObj('CanvasNgxComponent', ['getCanvasUrlData', 'getCanvasData']);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set the original canvas', () => {
        service.setCanvas(canvas, 'Image Original');
        expect(service['canvasOriginal']).toEqual(canvas);
    });

    it('should set the modified canvas', () => {
        service.setCanvas(canvas, 'Image Modifiée');
        expect(service['canvasModifier']).toEqual(canvas);
    });

    it('should throw an error when setting an unknown canvas', () => {
        expect(() => {
            service.setCanvas(canvas, 'Unknown');
        }).toThrowError('Canvas name not found');
    });

    it('should get the data URL of the original canvas', () => {
        canvas.getCanvasUrlData.and.returnValue('data:image/png;base64,...');
        service['canvasOriginal'] = canvas;
        expect(service.getCanvasUrlData('Image Original')).toEqual('data:image/png;base64,...');
        expect(canvas.getCanvasUrlData).toHaveBeenCalled();
    });

    it('should get the data URL of the modified canvas', () => {
        canvas.getCanvasUrlData.and.returnValue('data:image/png;base64,...');
        service['canvasModifier'] = canvas;
        expect(service.getCanvasUrlData('Image Modifiée')).toEqual('data:image/png;base64,...');
        expect(canvas.getCanvasUrlData).toHaveBeenCalled();
    });

    it('should throw an error when getting data URL of an unknown canvas', () => {
        expect(() => {
            service.getCanvasUrlData('Unknown');
        }).toThrowError('Canvas name not found');
    });

    it('should get the data of the original canvas', () => {
        const length = 4;
        const data = new Uint8ClampedArray(length);
        canvas.getCanvasData.and.returnValue(data);
        service['canvasOriginal'] = canvas;
        expect(service.getCanvasData('Image Original')).toEqual(data);
        expect(canvas.getCanvasData).toHaveBeenCalled();
    });

    it('should get the data of the modified canvas', () => {
        const length = 4;
        const data = new Uint8ClampedArray(length);
        canvas.getCanvasData.and.returnValue(data);
        service['canvasModifier'] = canvas;
        expect(service.getCanvasData('Image Modifiée')).toEqual(data);
        expect(canvas.getCanvasData).toHaveBeenCalled();
    });

    it('should throw an error when getting data of an unknown canvas', () => {
        expect(() => {
            service.getCanvasData('Unknown');
        }).toThrowError('Canvas name not found');
    });
});
