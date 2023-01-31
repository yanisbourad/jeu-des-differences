/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';
import { BfsInput } from '@app/interfaces/bfs-input';
import { PixelMatrix } from '@app/interfaces/pixel-matrix';
import { Point } from '@app/interfaces/point';
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
    setDiffPixels: Set<number>;
    differenceMatrix: number[] = [];
    pixelNumberByImage: number = 0;
    mapDistPoint: Map<number, number> = new Map();
    listBfsInput: BfsInput[] = [];
    constructor() {
        this.originalPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
        this.modifiedPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
        this.setDiffPixels = new Set();
    }

    clearService(): void {
        this.originalPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
        this.modifiedPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
        this.setDiffPixels = new Set();
        this.differenceMatrix = [];
        this.drawingDifferenceArray = new Uint8ClampedArray([]);
        this.hasBeenChanged = false;
        this.imageMatrixSize = 0;
        this.pixelNumberByImage = 0;
        this.mapDistPoint = new Map();
        this.listBfsInput = [];
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
            for (let i = 0; i < this.imageMatrixSize; i = i + constants.nextPixelStartIndex) {
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
            for (let i = 0; i < this.pixelNumberByImage; i++) {
                if (
                    this.originalPixelMatrix.red[i] === this.modifiedPixelMatrix.red[i] &&
                    this.originalPixelMatrix.green[i] === this.modifiedPixelMatrix.green[i] &&
                    this.originalPixelMatrix.blue[i] === this.modifiedPixelMatrix.blue[i] &&
                    this.originalPixelMatrix.alpha[i] === this.modifiedPixelMatrix.alpha[i]
                ) {
                    this.differenceMatrix.push(0);
                } else {
                    this.setDiffPixels.add(i);
                    this.differenceMatrix.push(1);
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
    defineDifferences(): void {
        const listDifferences: number[][] = [];
        while (this.setDiffPixels.size > 0) {
            this.mapDistPoint = new Map();
            const position = [...this.setDiffPixels][0];
            const point = this.getPositionFromAbsolute(position);
            this.differenceMatrix = [];
            this.listBfsInput.push({ x: point.x, y: point.y, distance: 0, radius: 3 });
            while (this.listBfsInput.length > 0) {
                const bfsInput = this.listBfsInput.pop();
                if (bfsInput) this.bfs(bfsInput.x, bfsInput.y, bfsInput.distance, bfsInput.radius);
            }
            listDifferences.push(this.differenceMatrix);
        }
        this.differenceMatrix = [];
        console.log(listDifferences);
        console.log(listDifferences.length);
        this.clearService();
        // this.drawingDifferenceArray;
    }

    bfs(x: number, y: number, distance: number, radius: number): void {
        if (x < 0 || y < 0 || x >= constants.defaultWidth || y >= constants.defaultHeight) {
            return;
        }
        const position = this.getPositionsFromXY(x, y);
        if (this.drawingDifferenceArray[position] === 1) {
            if (this.setDiffPixels.has(position)) {
                this.setDiffPixels.delete(position);
                this.differenceMatrix.push(position);
                distance = 0;
            } else {
                return;
            }
        } else {
            const currentDistance = this.mapDistPoint.get(position) || radius + 1;
            if (distance++ < radius + 1 && currentDistance > distance) {
                this.mapDistPoint.set(position, distance);
                this.differenceMatrix.push(position);
            } else {
                return;
            }
        }
        this.listBfsInput.push({ x: x + 1, y, distance, radius });
        this.listBfsInput.push({ x: x - 1, y, distance, radius });
        this.listBfsInput.push({ x, y: y + 1, distance, radius });
        this.listBfsInput.push({ x, y: y - 1, distance, radius });
    }
    getPositionsFromXY(x: number, y: number): number {
        return x + y * constants.defaultWidth;
        // position = this.getPositionsFromXY(3, 4);
        // drawingDifferenceArray[position];
    }
    getPositionFromAbsolute(x: number): Point {
        const y = Math.floor(x / constants.defaultWidth);
        const xPosition = x - y * constants.defaultWidth;
        return { x: xPosition, y };
    }
}
