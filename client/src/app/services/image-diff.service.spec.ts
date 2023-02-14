/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { ImageDiffService } from './image-diff.service';

describe('ImageDiffService', () => {
    let service: ImageDiffService;

    let originalArrayData: number[];
    let modifiedArrayData: number[];

    let testArrayData: number[];
    let arrayData: number[];

    let originalCanvasArray: Uint8ClampedArray;
    let modifiedCanvasArray: Uint8ClampedArray;

    let radiusValue: number;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ImageDiffService],
        });
        service = TestBed.inject(ImageDiffService);
        originalArrayData = [1, 2, 3, 4, 5, 6, 7, 8];
        modifiedArrayData = [9, 8, 7, 6, 5, 4, 3, 2];
        testArrayData = [1, 2, 2, 4, 6, 7, 8, 5];
        arrayData = [1, 3, 5, 6, 8, 0, 1, 6];
        originalCanvasArray = new Uint8ClampedArray([1, 2, 3, 4, 5, 6, 7, 8]);
        modifiedCanvasArray = new Uint8ClampedArray([9, 8, 7, 6, 5, 4, 3, 2]);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should allocate radius value', () => {
        radiusValue = 5;
        service.setRadius = radiusValue;
        expect(service.radius).toBe(radiusValue);
    });

    it('should generate a original and modified Arrays to calculate differences', () => {
        // set image data on mock canvas elements
        service.setImageData(originalCanvasArray, modifiedCanvasArray);
        expect(service.originalImageData.length).toBe(8);
        expect(service.modifiedImageData.length).toBe(8);
    });
    it('should not generate Arrays to calculate differences with different image size', () => {
        // set image data on mock canvas elements
        service.setImageData(new Uint8ClampedArray([1, 2, 3, 5]), new Uint8ClampedArray([1, 2, 3, 5, 4, 5, 6, 8]));
        expect(service.originalImageData.length).toBe(0);
        expect(service.modifiedImageData.length).toBe(0);
    });

    it('should return true, arrays are not empty', () => {
        service.originalImageData = testArrayData;
        service.modifiedImageData = testArrayData;
        const res = service.areEmpty();
        expect(res).toBeFalsy();
    });

    it('should return false, arrays have not elements', () => {
        service.originalImageData = [];
        service.modifiedImageData = [];
        const res = service.areEmpty();
        expect(res).toBeTruthy();
    });

    it('should set pixel matrices correctly', () => {
        service.originalImageData = originalArrayData;
        service.modifiedImageData = modifiedArrayData;
        service.readData();

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
        service.originalImageData = [];
        service.modifiedImageData = [];

        const spy = spyOn(service, 'resetImageData').and.callThrough();
        service.readData();
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

    it('should generate pixel Image Matrices from Uint8ClampedArray image data', () => {
        // set image data on mock canvas elements
        const spyA = spyOn(service, 'setImageData').and.callThrough();
        const spyB = spyOn(service, 'readData').and.callThrough();
        const spyC = spyOn(service, 'resetImageData').and.callThrough();
        service.setPixelMatrix();
        expect(spyA).toHaveBeenCalled();
        expect(spyB).toHaveBeenCalled();
        expect(spyC).toHaveBeenCalled();
    });

    it('should generate difference matrix from same image data', () => {
        // set image data on mock canvas elements
        service.originalImageData = testArrayData;
        service.modifiedImageData = testArrayData;
        service.pixelNumberByImage = 2;

        const spy = spyOn(service, 'areEmpty').and.callThrough();
        service.getDifferenceMatrix();
        expect(service.differenceMatrix.length).toBe(2);
        expect(service.differenceMatrix[0]).toBe(0);
        expect(service.differenceMatrix[1]).toBe(0);
        // expect(service.differenceMatrix.length).toBe(2);
        expect(spy).toHaveBeenCalled();
    });

    it('should generate difference matrix from different image data', () => {
        // set image data on mock canvas elements
        service.originalImageData = testArrayData;
        service.modifiedImageData = arrayData;
        service.pixelNumberByImage = 2;

        const spy = spyOn(service, 'areEmpty').and.callThrough();
        service.readData();
        service.getDifferenceMatrix();
        expect(service.differenceMatrix[0]).toBe(1);
        expect(service.differenceMatrix[1]).toBe(1);
        expect(service.differenceMatrix.length).toBe(2);
        expect(spy).toHaveBeenCalled();
    });

    it('should not generate difference matrix from different size image data', () => {
        // set image data on mock canvas elements
        service.originalImageData = [1, 2, 3, 5];
        service.modifiedImageData = [1, 2, 3, 4, 5, 6, 7, 8];
        service.getDifferenceMatrix();
        expect(service.differenceMatrix.length).toBe(0);
        // expect(service.differencePixelArray.length).toBe(0);
    });

    // it('should generate a Uint8ClampedArray to create differences image data', () => {
    //     // set image data on mock canvas elements
    //     service.originalImageData = testArrayData;
    //     service.modifiedImageData = testArrayData;
    //     service.pixelNumberByImage = 2;

    //     const spy = spyOn(service, 'getDifferenceMatrix').and.callThrough();
    //     service.setDifferenceDataToDraw();
    //     expect(service.drawingDifferenceArray.length).toBe(8);
    //     expect(spy).toHaveBeenCalled();
    // });

    it('should return the position combining X and Y coordinates', () => {
        const res = service.getPositionsFromXY(1, 2);
        expect(res).toBe(1281);
    });

    it('should return the absolute position', () => {
        const res = service.getPositionFromAbsolute(1);
        expect(res.x).toBe(1 - 640 * Math.floor(1 / 640));
        expect(res.y).toBe(Math.floor(1 / 640));
    });

    it('should return Facile as game level', () => {
        service.listDifferences = [];
        const set1 = new Set<number>().add(1).add(2);
        const set2 = new Set<number>().add(1).add(2).add(3);
        service.listDifferences.push(set1, set2);
        const res: string = service.getDifficulty();
        expect(res).toBe('Facile');
    });

    it('should return Difficile as game level', () => {
        service.listDifferences = [];
        const set1 = new Set<number>().add(1).add(2);
        const set2 = new Set<number>().add(1).add(2).add(3);
        const set3 = new Set<number>().add(1).add(2).add(3).add(4);
        service.listDifferences.push(set1, set3, set1, set2, set2, set3, set1);
        const res: string = service.getDifficulty();
        expect(res).toBe('Difficile');
    });

    it('should genenerate a list of differences', () => {
        // with radius 0 should return 4 differences
        service.radius = 0;
        service.setDiffPixels = new Set([1, 3, 5, 7]);
        service.differenceMatrix = [0, 1, 0, 1, 0, 1, 0, 1];
        service.listDifferences = [];
        service.defineDifferences();
        expect(service.listDifferences.length).toBe(4);

        // with radius 3 should return 1 difference
        service.radius = 3;
        service.setDiffPixels = new Set([1, 3, 5, 7]);
        service.differenceMatrix = [0, 1, 0, 1, 0, 1, 0, 1];
        service.listDifferences = [];
        service.defineDifferences();
        expect(service.listDifferences.length).toBe(1);

        // with radius 6 should return 2 difference
        service.radius = 6;
        service.setDiffPixels = new Set([1, 9]);
        service.differenceMatrix = [0, 1, 0, 0, 0, 0, 0, 0, 0, 1];
        service.listDifferences = [];
        service.defineDifferences();
        expect(service.listDifferences.length).toBe(2);
    });
});
