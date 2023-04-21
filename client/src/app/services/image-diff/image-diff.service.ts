import { Injectable } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';
import { BfsInput } from '@app/interfaces/bfs-input';
import { PixelMatrix } from '@app/interfaces/pixel-matrix';
import { Point } from '@app/interfaces/point';

@Injectable({
    providedIn: 'root',
})
export class ImageDiffService {
    // rgba array of data
    originalImageData: number[];
    modifiedImageData: number[];
    radius: number;

    // Derived matrices red green blue alpha
    originalPixelMatrix: PixelMatrix;
    modifiedPixelMatrix: PixelMatrix;
    drawingDifferenceArray: Uint8ClampedArray;
    hasBeenChanged: boolean;
    setDiffPixels: Set<number>;
    listDifferencesLength: number = 0;
    currentDifferenceTemp: Set<number>;
    listDifferences: Set<number>[];
    differenceMatrix: number[];
    pixelNumberByImage: number;
    mapDistPoint: Map<number, number>;
    listBfsInput: BfsInput[] = [];
    differenceNumber;
    upperLimitDifficultyLevel: number;
    ratioLimitDifficultyLevel: number;
    private imageMatrixSize: number;

    constructor() {
        this.originalPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
        this.modifiedPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
        this.setDiffPixels = new Set();
        this.radius = constants.DEFAULT_RADIUS;
        this.differenceMatrix = [];
        this.pixelNumberByImage = 0;
        this.hasBeenChanged = false;
        this.mapDistPoint = new Map();
        this.imageMatrixSize = 0;
        this.differenceNumber = 0;
        this.upperLimitDifficultyLevel = 7;
        this.ratioLimitDifficultyLevel = 0.15;
    }

    set setRadius(radius: number) {
        this.radius = radius;
    }

    resetImageData(): void {
        this.originalPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
        this.modifiedPixelMatrix = { red: [], green: [], blue: [], alpha: [] };
        this.differenceMatrix = [];
        this.drawingDifferenceArray = new Uint8ClampedArray([]);
        this.setDiffPixels = new Set();
        this.hasBeenChanged = false;
        this.imageMatrixSize = 0;
        this.pixelNumberByImage = 0;
        this.mapDistPoint = new Map();
        this.listBfsInput = [];
        this.listDifferences = [];
    }

    setImageData(originalCanvasArray: Uint8ClampedArray, modifiedCanvasArray: Uint8ClampedArray): void {
        if (originalCanvasArray.length === modifiedCanvasArray.length) {
            this.originalImageData = Array.prototype.slice.call(originalCanvasArray);
            this.modifiedImageData = Array.prototype.slice.call(modifiedCanvasArray);
        } else {
            this.originalImageData = [];
            this.modifiedImageData = [];
        }
    }

    areEmpty(): boolean {
        return this.originalImageData.length === 0 && this.modifiedImageData.length === 0;
    }

    readData(): void {
        if (!this.areEmpty()) {
            this.imageMatrixSize = this.originalImageData.length;
            for (let i = 0; i < this.imageMatrixSize; i = i + constants.NEXT_PIXEL_START_INDEX) {
                this.originalPixelMatrix.red.push(this.originalImageData[i]);
                this.originalPixelMatrix.green.push(this.originalImageData[i + 1]);
                this.originalPixelMatrix.blue.push(this.originalImageData[i + 2]);
                this.originalPixelMatrix.alpha.push(this.originalImageData[i + 3]);

                this.modifiedPixelMatrix.red.push(this.modifiedImageData[i]);
                this.modifiedPixelMatrix.green.push(this.modifiedImageData[i + 1]);
                this.modifiedPixelMatrix.blue.push(this.modifiedImageData[i + 2]);
                this.modifiedPixelMatrix.alpha.push(this.modifiedImageData[i + 3]);
            }
            this.pixelNumberByImage = this.originalPixelMatrix.red.length;
        } else {
            this.resetImageData();
        }
    }

    setPixelMatrix(originalCanvasArray: Uint8ClampedArray, modifiedCanvasArray: Uint8ClampedArray): void {
        this.resetImageData();
        this.setImageData(originalCanvasArray, modifiedCanvasArray);
        this.readData();
    }

    getDifferenceMatrix(): void {
        this.differenceMatrix = [];
        if (!this.areEmpty()) {
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
        }
    }

    defineDifferences(): Set<number>[] {
        // listDifferences is the list of independent differences
        this.listDifferences = [];
        while (this.setDiffPixels.size > 0) {
            // represent for each key of position the last smallest distance from a real diff
            this.mapDistPoint = new Map();

            // get fist diff position
            const position = [...this.setDiffPixels][0];
            const point: Point = this.getPositionFromAbsolute(position);

            // differenceMatrix is a Point[] representing one difference
            this.currentDifferenceTemp = new Set<number>();
            this.listBfsInput.push({ point, distance: 0 });
            while (this.listBfsInput.length > 0) {
                const bfsInput = this.listBfsInput.pop();
                if (bfsInput) this.bfs(bfsInput.point, bfsInput.distance, this.radius);
            }

            // after all the recursive calls has ended add the current diff to the diff list
            this.listDifferences.push(this.currentDifferenceTemp);
        }

        this.currentDifferenceTemp = new Set<number>();
        // clearing the service is needed to be able to read the next images
        this.listDifferencesLength = this.listDifferences.length;
        return this.listDifferences;
    }

    bfs(point: Point, distance: number, radius: number): void {
        if (this.pointIsOutOfBorder(point)) return;

        const position = this.getPositionsFromXY(point.x, point.y);
        if (this.differenceMatrix[position] === 1) {
            // if is a difference
            distance = this.bfsHandleIsDifferent(position);
        } else {
            // if not a difference
            distance = this.bfsHandleIsNotDifferent(position, distance, radius);
        }
        if (distance !== constants.BFS_IGNORE_POINT) this.bfsAddNeighbors(point, distance);
    }

    getDifficulty(): string {
        let count = 0;
        this.listDifferences.forEach((a: Set<number>) => {
            count += a.size;
        });
        const totalSurface: number = constants.DEFAULT_WIDTH * constants.DEFAULT_HEIGHT;

        if (this.listDifferences.length >= this.upperLimitDifficultyLevel && count / totalSurface < this.ratioLimitDifficultyLevel)
            return 'Difficile';
        return 'Facile';
    }

    getPositionsFromXY(x: number, y: number): number {
        return x + y * constants.DEFAULT_WIDTH;
    }

    getPositionFromAbsolute(x: number): Point {
        const y = Math.floor(x / constants.DEFAULT_WIDTH);
        const xPosition = x - y * constants.DEFAULT_WIDTH;
        return { x: xPosition, y };
    }

    private pointIsOutOfBorder(point: Point): boolean {
        if (point.x < 0 || point.y < 0 || point.x >= constants.DEFAULT_WIDTH || point.y >= constants.DEFAULT_HEIGHT) {
            // Point is outside of borderers
            return true;
        }
        return false;
    }

    private bfsAddNeighbors(point: Point, distance: number): void {
        // Adding the 8 neighbors of the current point
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                this.listBfsInput.push({ point: { x: point.x + i, y: point.y + j }, distance });
            }
        }
    }

    private bfsHandleIsNotDifferent(position: number, distance: number, radius: number): number {
        let lastDistance = this.mapDistPoint.get(position);
        // if fist time reading this point
        if (!lastDistance) {
            // puts the lastDistance as unreachable
            lastDistance = radius + 1;
        }

        if (distance < radius && distance < lastDistance) {
            // adding it to the differenceMatrix
            this.currentDifferenceTemp.add(position);
            // if distance is the lower ever found
            this.mapDistPoint.set(position, distance);
            // next bfs should have a distance greater than the parent
            return distance + 1;
        }
        // distance is greater than the max radius
        return constants.BFS_IGNORE_POINT;
    }

    private bfsHandleIsDifferent(position: number): number {
        if (this.setDiffPixels.has(position)) {
            // if the difference has never been visited before
            this.setDiffPixels.delete(position);
            // add this position to the differenceMatrix
            this.currentDifferenceTemp.add(position);
            // next bfs will have a distance of 0
            return 0;
        }
        // Point already visited
        return constants.BFS_IGNORE_POINT;
    }
}
