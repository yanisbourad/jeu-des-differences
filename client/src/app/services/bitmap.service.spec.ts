import { TestBed } from '@angular/core/testing';
import * as constants from '@app/configuration/const-canvas';
import { BitmapService } from './bitmap.service';

describe('CanvasHolderServiceService', () => {
    let service: BitmapService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BitmapService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return a File', async () => {
        const blob = await fetch('/assets/image_empty.bmp').then(async (r) => r.blob());
        const file = new File([blob], 'imag-expl.bmp', { type: 'image/bmp' });
        const event = new Event('change', {});
        Object.defineProperty(event, 'target', {
            value: {
                files: [file],
            },
        });
        const returnedFile = service.getFile(event);
        expect(returnedFile).toBeTruthy();
    });
    it('should return a undefined', () => {
        const event = new Event('change', {});
        Object.defineProperty(event, 'target', {
            value: {
                files: null,
            },
        });
        const returnedFile = service.getFile(event);
        expect(returnedFile).toBeTruthy();
    });

    it('should return a Bitmap', async () => {
        const blob = await fetch('/assets/image_empty.bmp').then(async (r) => r.blob());
        const file = new File([blob], 'imag-expl.bmp', { type: 'image/bmp' });
        const bitmap = await service.fileToImageBitmap(file);
        expect(bitmap).toBeTruthy();
    });

    it('should return false if the file is wrong bit depth', async () => {
        const blob = await fetch('/assets/image_wrong_bit_depth.bmp').then(async (r) => r.blob());
        const file = await new File([blob], 'imag-expl.bmp', { type: 'image/bmp' });
        const isValid = await (await service.validateBitmap(file)).valueOf();
        expect(isValid).toBeFalsy();
    });

    it('should return false if the file is wrong header', async () => {
        const blob = await fetch('/assets/imagePaysage.jpeg').then(async (r) => r.blob());
        const file = await new File([blob], 'imag-expl.bmp', { type: 'image/bmp' });
        const isValid = (await service.validateBitmap(file)).valueOf();
        expect(isValid).toBeFalsy();
    });

    it('should return false if the file is wrong size', async () => {
        const blob = await (await fetch('./assets/sample_640x426.bmp')).blob();
        const file = await new File([blob], 'imag-expl.bmp', { type: 'image/bmp' });
        const image = await service.fileToImageBitmap(file);
        const isValid = await service.validateSize(image).valueOf();
        expect(isValid).toEqual(false);
    });

    it('should return a new ImageBitmap', async () => {
        const blob = await fetch('/assets/image_empty.bmp').then(async (r) => r.blob());
        const file = new File([blob], 'imag-expl.bmp', { type: 'image/bmp' });
        const event = new Event('change', {});
        Object.defineProperty(event, 'target', {
            value: {
                files: [file],
            },
        });
        const bitmap = await service.handleFileSelect(event);
        expect(bitmap?.height).toEqual(constants.DEFAULT_HEIGHT);
        expect(bitmap?.width).toEqual(constants.DEFAULT_WIDTH);
    });

    it('should return a new ImageBitmap when the file is not the correct form with alert', async () => {
        const blob = await fetch('/assets/imagePaysage.jpeg').then(async (r) => r.blob());
        const spy = spyOn(window, 'alert');
        const file = new File([blob], 'imag-expl.bmp', { type: 'image/bmp' });
        const event = new Event('change', {});
        Object.defineProperty(event, 'target', {
            value: {
                files: [file],
            },
        });
        const bitmap = await service.handleFileSelect(event);
        expect(bitmap).toBeUndefined();
        expect(spy).toHaveBeenCalled();
    });

    it('should return a new ImageBitmap when the file is not the correct size with alert', async () => {
        const blob = await fetch('./assets/sample_640x426.bmp').then(async (r) => r.blob());
        const spy = spyOn(window, 'alert');
        const file = new File([blob], 'imag-expl.bmp', { type: 'image/bmp' });
        const event = new Event('change', {});
        Object.defineProperty(event, 'target', {
            value: {
                files: [file],
            },
        });
        const bitmap = await service.handleFileSelect(event);
        expect(bitmap).toBeUndefined();
        expect(spy).toHaveBeenCalled();
    });
});
