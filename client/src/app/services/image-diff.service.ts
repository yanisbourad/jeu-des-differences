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
    radius: number;

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
        this.radius = constants.defaultRadius;
    }

    set setRadius(radius: number) {
        this.radius = radius;
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
        // listDifferences is the list of independent differences
        const listDifferences: number[][] = [];
        while (this.setDiffPixels.size > 0) {
            // represent for each key of position the last smallest distance from a real diff
            this.mapDistPoint = new Map();
            // get fist diff position
            const position = [...this.setDiffPixels][0];
            const point: Point = this.getPositionFromAbsolute(position);
            // differenceMatrix is a Point[] representing one difference
            this.differenceMatrix = [];
            this.listBfsInput.push({ point, distance: 0 });
            while (this.listBfsInput.length > 0) {
                const bfsInput = this.listBfsInput.pop();
                if (bfsInput) this.bfs(bfsInput.point, bfsInput.distance, this.radius);
            }
            // after all the recursive calls has ended add the current diff to the diff list
            listDifferences.push(this.differenceMatrix);
        }
        this.differenceMatrix = [];
        console.log(listDifferences);
        console.log(listDifferences.length);
        // clearing the service is needed to be able to read the next images
        this.clearService();
    }

    bfs(point: Point, distance: number, radius: number): void {
        if (point.x < 0 || point.y < 0 || point.x >= constants.defaultWidth || point.y >= constants.defaultHeight) {
            // Point is outside of borderers
            return;
        }
        const position = this.getPositionsFromXY(point.x, point.y);
        if (this.drawingDifferenceArray[position] === 1) {
            // if is a difference
            if (this.setDiffPixels.has(position)) {
                // if the difference has never been visited before
                this.setDiffPixels.delete(position);
                // add this position to the differenceMatrix
                this.differenceMatrix.push(position);
                // next bfs will have a distance of 0
                distance = 0;
            } else {
                // already visited
                return;
            }
        } else {
            // if not a difference
            let lastDistance = this.mapDistPoint.get(position);
            // if fist time reading this point
            if (!lastDistance) {
                // adding it to the differenceMatrix
                this.differenceMatrix.push(position);
                // puts the lastDistance as unreachable
                lastDistance = radius + 1;
            }
            if (distance < radius && distance < lastDistance) {
                // if distance is the lower ever found
                this.mapDistPoint.set(position, distance);
                // next bfs should have a distance greater than the parent
                distance++;
            } else {
                // distance is greater than the max radius
                return;
            }
        }
        this.listBfsInput.push({ point: { x: point.x + 1, y: point.y }, distance });
        this.listBfsInput.push({ point: { x: point.x - 1, y: point.y }, distance });
        this.listBfsInput.push({ point: { x: point.x, y: point.y + 1 }, distance });
        this.listBfsInput.push({ point: { x: point.x, y: point.y - 1 }, distance });
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
