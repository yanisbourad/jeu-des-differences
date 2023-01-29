/* eslint-disable @typescript-eslint/member-ordering */
import { ElementRef, Injectable } from '@angular/core';
import { PixelMatrix } from '@app/interfaces/pixel-matrix';

@Injectable({
    providedIn: 'root',
})
export class ImageDiffService {
    // rgba array of data
    originalImageData: number[];
    modifiedImageData: number[];

    test: string = 'test';

    // derived matrices red green blue alpha
    originalPixelMatrix: PixelMatrix;
    modifiedPixelMatrix: PixelMatrix;

    private imageMatrixSize: number = 0;
    // private differenceMatrix: number[] = [];
    // private pixelNumberByImage: number = 0;

    NEXT_PIXEL_START_INDEX: number = 4;
    INCREMENT_VALUE: number = 1;

    constructor() {
        this.originalPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
        this.modifiedPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
    }
    private resetImageData(): void {
        this.originalPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
        this.modifiedPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
    }

    haveSameSize(): boolean {
        return this.originalImageData.length === this.modifiedImageData.length;
    }

    createPixelMatrix(originalCanvas: ElementRef, modifiedCanvas: ElementRef): void {
        this.resetImageData();
        this.originalImageData = Array.prototype.slice.call(
            originalCanvas.nativeElement.getContext('2d').getImageData(0, 0, originalCanvas.nativeElement.width, originalCanvas.nativeElement.height)
                .data,
        );

        this.modifiedImageData = Array.prototype.slice.call(
            modifiedCanvas.nativeElement.getContext('2d').getImageData(0, 0, modifiedCanvas.nativeElement.width, modifiedCanvas.nativeElement.height)
                .data,
        );
        this.imageMatrixSize = this.originalImageData.length;
        for (let i = 0; i < this.imageMatrixSize; i = i + this.NEXT_PIXEL_START_INDEX) {
            this.originalPixelMatrix.red.push(this.originalImageData[i]);
            this.originalPixelMatrix.green.push(this.originalImageData[i + 1]);
            this.originalPixelMatrix.blue.push(this.originalImageData[i + 2]);
            this.originalPixelMatrix.alpha.push(this.originalImageData[i + 3]);
            this.modifiedPixelMatrix.red.push(this.modifiedImageData[i]);
            this.modifiedPixelMatrix.green.push(this.modifiedImageData[i + 1]);
            this.modifiedPixelMatrix.blue.push(this.modifiedImageData[i + 2]);
            this.modifiedPixelMatrix.alpha.push(this.modifiedImageData[i + 3]);
        }
        console.log(this.originalPixelMatrix);
    }
}
