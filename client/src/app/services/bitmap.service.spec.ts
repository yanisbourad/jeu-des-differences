import { TestBed } from '@angular/core/testing';
import * as constants from '@app/configuration/const-canvas';
import { BitmapService } from './bitmap.service';

describe('CanvasHolderServiceService', () => {
    let service: BitmapService;
    let imageNormal: File;
    let imageWrongBitDepth: File;
    let imageWrongHeader: File;
    let imageWrongSize: File;

    beforeEach(async () => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BitmapService);
        const blob = await fetch('/assets/image_empty.bmp').then(async (r) => r.blob());
        imageNormal = new File([blob], 'imag-expl.bmp', { type: 'image/bmp' });
        const blob2 = await fetch('/assets/image_wrong_bit_depth.bmp').then(async (r) => r.blob());
        imageWrongBitDepth = new File([blob2], 'imag-expl.bmp', { type: 'image/bmp' });
        const blob3 = await fetch('/assets/imagePaysage.jpeg').then(async (r) => r.blob());
        imageWrongHeader = new File([blob3], 'imag-expl.bmp', { type: 'image/bmp' });
        const blob4 = await fetch('/assets/sample_640x426.bmp').then(async (r) => r.blob());
        imageWrongSize = new File([blob4], 'imag-expl.bmp', { type: 'image/bmp' });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return a File', async () => {
        const event = new Event('change', {});
        Object.defineProperty(event, 'target', {
            value: {
                files: [imageNormal],
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
        expect(returnedFile.size).toEqual(0);
    });

    it('should return a Bitmap', async () => {
        const bitmap = await service.fileToImageBitmap(imageNormal);
        expect(bitmap).toBeTruthy();
    });

    it('should return false if the file is wrong bit depth', async () => {
        const isValid = await (await service.validateBitmap(imageWrongBitDepth)).valueOf();
        expect(isValid).toBeFalsy();
    });

    it('should return false if the file is wrong header', async () => {
        const blob = await fetch('/assets/imagePaysage.jpeg').then(async (r) => r.blob());
        const file = await new File([blob], 'imag-expl.bmp', { type: 'image/bmp' });
        const isValid = (await service.validateBitmap(file)).valueOf();
        expect(isValid).toBeFalsy();
    });

    it('should return false if the file is wrong size', async () => {
        const image = await service.fileToImageBitmap(imageWrongSize);
        const isValid = await service.validateSize(image).valueOf();
        expect(isValid).toEqual(false);
    });

    it('should return a new ImageBitmap', async () => {
        const event = new Event('change', {});
        Object.defineProperty(event, 'target', {
            value: {
                files: [imageNormal],
            },
        });
        const bitmap = await service.handleFileSelect(event);
        expect(bitmap).toBeTruthy();
        expect(bitmap?.height).toEqual(constants.DEFAULT_HEIGHT);
        expect(bitmap?.width).toEqual(constants.DEFAULT_WIDTH);
    });

    it('should return a new ImageBitmap when the file is not the correct form with alert', async () => {
        const spy = spyOn(window, 'alert');
        const spy2 = spyOn(service, 'fileToImageBitmap');
        const event = await new Event('change', {});
        Object.defineProperty(event, 'target', {
            value: {
                files: [imageWrongHeader],
            },
        });
        const bitmap = await service.handleFileSelect(event);
        expect(bitmap).toBeUndefined();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy2).not.toHaveBeenCalled();
    });

    it('should return a new ImageBitmap when the file is not the correct size with alert', async () => {
        const spy2 = spyOn(service, 'validateSize').and.returnValue(false);

        const event = new Event('change', {});
        Object.defineProperty(event, 'target', {
            value: {
                files: [imageWrongSize],
            },
        });
        const bitmap = await service.handleFileSelect(event);
        expect(bitmap).toBeUndefined();
        expect(spy2).toHaveBeenCalled();
    });
});
