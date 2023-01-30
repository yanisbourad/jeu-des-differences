/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { ImageDiffService } from './image-diff.service';

describe('ImageDiffService', () => {
    let service: ImageDiffService;

    let originalArrayData: number[];
    let modifiedArrayData: number[];

    let testArrayData: number[];
    let arrayData: number[];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ImageDiffService],
        });
        service = TestBed.inject(ImageDiffService);
        originalArrayData = [1, 2, 3, 4, 5, 6, 7, 8];
        modifiedArrayData = [9, 8, 7, 6, 5, 4, 3, 2];
        testArrayData = [1, 2, 2, 4, 6, 7, 8, 5];
        arrayData = [1, 3, 5, 6, 8, 0, 1, 6];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return true, arrays are of the same length', () => {
        const res = service.haveSameSize(originalArrayData, modifiedArrayData);
        expect(res).toBeTruthy();
    });

    it('should return false, arrays are of the different length', () => {
        const res = service.haveSameSize([1, 2], [1, 2, 3]);
        expect(res).toBeFalsy();
    });

    it('should set pixel matrices correctly', () => {
        service.readData(originalArrayData, modifiedArrayData);

        expect(service.originalPixelMatrix.red[0]).toBe(1);
        expect(service.originalPixelMatrix.red[1]).toBe(5);
        expect(service.originalPixelMatrix.green[0]).toBe(2);
        expect(service.originalPixelMatrix.green[1]).toBe(6);
        expect(service.originalPixelMatrix.blue[0]).toBe(3);
        expect(service.originalPixelMatrix.blue[1]).toBe(7);
        expect(service.originalPixelMatrix.alpha[0]).toBe(4);
        expect(service.originalPixelMatrix.alpha[1]).toBe(8);

        expect(service.modifiedPixelMatrix.red[0]).toBe(9);
        expect(service.modifiedPixelMatrix.red[1]).toBe(5);
        expect(service.modifiedPixelMatrix.green[0]).toBe(8);
        expect(service.modifiedPixelMatrix.green[1]).toBe(4);
        expect(service.modifiedPixelMatrix.blue[0]).toBe(7);
        expect(service.modifiedPixelMatrix.blue[1]).toBe(3);
        expect(service.modifiedPixelMatrix.alpha[0]).toBe(6);
        expect(service.modifiedPixelMatrix.alpha[1]).toBe(2);
    });
    it('should not set pixel arrays and should call resetImageData', () => {
        // set image data on mock canvas elements

        const spy = spyOn(service, 'resetImageData').and.callThrough();
        service.readData([1, 2, 3, 5], [1, 2, 3, 4, 3, 4, 5, 6]);
        expect(spy).toHaveBeenCalled();

        expect(service.originalPixelMatrix.red.length).toBe(0);
        expect(service.originalPixelMatrix.green.length).toBe(0);
        expect(service.originalPixelMatrix.blue.length).toBe(0);
        expect(service.originalPixelMatrix.alpha.length).toBe(0);
        expect(service.modifiedPixelMatrix.red.length).toBe(0);
        expect(service.modifiedPixelMatrix.green.length).toBe(0);
        expect(service.modifiedPixelMatrix.blue.length).toBe(0);
        expect(service.modifiedPixelMatrix.alpha.length).toBe(0);
    });

    it('should generate difference matrix from same image data', () => {
        // set image data on mock canvas elements
        service.originalImageData = testArrayData;
        service.modifiedImageData = testArrayData;
        service.pixelNumberByImage = 2;

        const spy = spyOn(service, 'haveSameSize').and.callThrough();
        const difference = service.getDifferenceMatrix();
        expect(service.differenceMatrix.length).toBe(difference.length);
        expect(service.differenceMatrix.length).toBe(8);
        expect(service.differenceMatrix[0]).toBe(0);
        expect(service.differenceMatrix[4]).toBe(0);
        expect(spy).toHaveBeenCalled();
    });

    it('should generate difference matrix from different image data', () => {
        // set image data on mock canvas elements
        service.originalImageData = testArrayData;
        service.modifiedImageData = arrayData;
        service.pixelNumberByImage = 2;

        const spy = spyOn(service, 'haveSameSize').and.callThrough();
        const difference = service.getDifferenceMatrix();
        expect(service.differenceMatrix.length).toBe(difference.length);
        expect(service.differenceMatrix.length).toBe(8);
        expect(service.differenceMatrix[0]).toBe(1);
        expect(service.differenceMatrix[4]).toBe(1);
        expect(spy).toHaveBeenCalled();
    });

    it('should not generate difference matrix from different size image data', () => {
        // set image data on mock canvas elements
        service.originalImageData = [1, 2, 3, 5];
        service.modifiedImageData = [1, 2, 3, 4, 5, 6, 7, 8];
        service.getDifferenceMatrix();
        expect(service.differenceMatrix.length).toBe(0);
    });

    it('should generate a Uint8ClampedArray to create differences image data', () => {
        // set image data on mock canvas elements
        service.originalImageData = testArrayData;
        service.modifiedImageData = testArrayData;
        service.pixelNumberByImage = 2;

        const spy = spyOn(service, 'getDifferenceMatrix').and.callThrough();
        service.setDifferenceDataToDraw();
        expect(service.drawingDifferenceArray.length).toBe(8);
        expect(spy).toHaveBeenCalled();
    });
});
