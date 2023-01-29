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

    // Derived matrices red green blue alpha
    originalPixelMatrix: PixelMatrix;
    modifiedPixelMatrix: PixelMatrix;
    drawingDifferenceArray: Uint8ClampedArray;
    hasBeenChanged: boolean = false;

    private imageMatrixSize: number = 0;
    private differenceMatrix: number[] = [];
    private pixelNumberByImage: number = 0;

    NEXT_PIXEL_START_INDEX: number = 4;
    INCREMENT_VALUE: number = 1;

    constructor() {
        this.originalPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
        this.modifiedPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
    }
    private resetImageData(): void {
        this.originalPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
        this.modifiedPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
        this.differenceMatrix = [];
        this.drawingDifferenceArray = new Uint8ClampedArray([]);
    }

    private haveSameSize(): boolean {
        return this.originalImageData.length === this.modifiedImageData.length;
    }

    private setImageData(originalCanvas: ElementRef, modifiedCanvas: ElementRef): void {
        this.originalImageData = Array.prototype.slice.call(
            originalCanvas.nativeElement.getContext('2d').getImageData(0, 0, originalCanvas.nativeElement.width, originalCanvas.nativeElement.height)
                .data,
        );

        this.modifiedImageData = Array.prototype.slice.call(
            modifiedCanvas.nativeElement.getContext('2d').getImageData(0, 0, modifiedCanvas.nativeElement.width, modifiedCanvas.nativeElement.height)
                .data,
        );
    }

    private readData(originalImageData: number[], modifiedImageData: number[]): void {
        this.imageMatrixSize = this.originalImageData.length;
        for (let i = 0; i < this.imageMatrixSize; i = i + this.NEXT_PIXEL_START_INDEX) {
            this.originalPixelMatrix.red.push(originalImageData[i]);
            this.originalPixelMatrix.green.push(originalImageData[i + 1]);
            this.originalPixelMatrix.blue.push(originalImageData[i + 2]);
            this.originalPixelMatrix.alpha.push(originalImageData[i + 3]);
            this.modifiedPixelMatrix.red.push(modifiedImageData[i]);
            this.modifiedPixelMatrix.green.push(modifiedImageData[i + 1]);
            this.modifiedPixelMatrix.blue.push(modifiedImageData[i + 2]);
            this.modifiedPixelMatrix.alpha.push(modifiedImageData[i + 3]);
        }
        this.pixelNumberByImage = this.originalPixelMatrix.red.length;
    }

    setPixelMatrix(originalCanvas: ElementRef, modifiedCanvas: ElementRef): void {
        this.resetImageData();
        this.setImageData(originalCanvas, modifiedCanvas);
        this.readData(this.originalImageData, this.modifiedImageData);
    }

    getDifferenceMatrix(): number[] {
        if (this.haveSameSize()) {
            this.differenceMatrix = [];
            for (let i = 0; i < this.pixelNumberByImage; i++) {
                if (
                    this.originalPixelMatrix.red[i] === this.modifiedPixelMatrix.red[i] &&
                    this.originalPixelMatrix.green[i] === this.modifiedPixelMatrix.green[i] &&
                    this.originalPixelMatrix.blue[i] === this.modifiedPixelMatrix.blue[i] &&
                    this.originalPixelMatrix.alpha[i] === this.modifiedPixelMatrix.alpha[i]
                ) {
                    this.differenceMatrix.push(0, 0, 0, 0);
                } else {
                    this.differenceMatrix.push(1, 1, 1, 1);
                }
            }
            return this.differenceMatrix;
        } else {
            return this.differenceMatrix;
        }
    }
    setDifferenceDataToDraw(): void {
        this.getDifferenceMatrix();
        if (!this.hasBeenChanged) {
            this.drawingDifferenceArray = new Uint8ClampedArray(this.differenceMatrix);
            console.log(this.drawingDifferenceArray);
        }
        this.hasBeenChanged = !this.hasBeenChanged;
    }
}
