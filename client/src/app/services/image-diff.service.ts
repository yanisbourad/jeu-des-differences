/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { PixelMatrix } from '@app/interfaces/pixel-matrix';

@Injectable({
    providedIn: 'root',
})
export class ImageDiffService {
    private imageMatrixSize: number = 0;
    // rgba array of data
    originalImageData: number[];
    modifiedImageData: number[];

    // Derived matrices red green blue alpha
    originalPixelMatrix: PixelMatrix;
    modifiedPixelMatrix: PixelMatrix;
    drawingDifferenceArray: Uint8ClampedArray;
    hasBeenChanged: boolean = false;

    differenceMatrix: number[] = [];
    pixelNumberByImage: number = 0;

    NEXT_PIXEL_START_INDEX: number = 4;
    INCREMENT_VALUE: number = 1;

    constructor() {
        this.originalPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
        this.modifiedPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
    }

    resetImageData(): void {
        this.originalPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
        this.modifiedPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
        this.differenceMatrix = [];
        this.drawingDifferenceArray = new Uint8ClampedArray([]);
    }

    setImageData(originalCanvasArray: Uint8ClampedArray, modifiedCanvasArray: Uint8ClampedArray): void {
        this.originalImageData = Array.prototype.slice.call(originalCanvasArray);
        this.modifiedImageData = Array.prototype.slice.call(modifiedCanvasArray);
    }

    haveSameSize(originalImageData: number[], modifiedImageData: number[]): boolean {
        return originalImageData.length === modifiedImageData.length;
    }

    readData(originalImageData: number[], modifiedImageData: number[]): void {
        if (this.haveSameSize(originalImageData, modifiedImageData)) {
            this.imageMatrixSize = originalImageData.length;
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
        } else {
            this.resetImageData();
        }
    }

    setPixelMatrix(originalCanvasArray: Uint8ClampedArray, modifiedCanvasArray: Uint8ClampedArray): void {
        this.resetImageData();
        this.setImageData(originalCanvasArray, modifiedCanvasArray);
        this.readData(this.originalImageData, this.modifiedImageData);
    }

    getDifferenceMatrix(): number[] {
        this.differenceMatrix = [];
        if (this.haveSameSize(this.originalImageData, this.modifiedImageData)) {
            this.readData(this.originalImageData, this.modifiedImageData);
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
        if (!this.hasBeenChanged && this.differenceMatrix.length !== 0) {
            this.drawingDifferenceArray = new Uint8ClampedArray(this.differenceMatrix);
        }
        this.hasBeenChanged = !this.hasBeenChanged;
    }
}
