import { TestBed } from '@angular/core/testing';
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
    it('should return a File', () => {
        const file = new File([], 'test.bmp', { type: 'image/bmp' });
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
        const blob = await fetch('/assets/imag-expl.bmp').then(async (r) => r.blob());
        const file = new File([blob], 'imag-expl.bmp', { type: 'image/bmp' });
        const bitmap = service.fileToImageBitmap(file);
        expect(bitmap).toBeTruthy();
    });
    it('should return true if the file contains a bitmap', async () => {
        const blob = await fetch('/assets/imag-expl.bmp').then(async (r) => r.blob());
        const file = new File([blob], 'imag-expl.bmp', { type: 'image/bmp' });
        const isValid = service.validateBitmap(file);
        expect(isValid).toBeTruthy();
    });
});
