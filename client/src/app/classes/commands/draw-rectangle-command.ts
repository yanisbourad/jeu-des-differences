import { ElementRef } from '@angular/core';
import { CommandSpecific } from '@app/classes/command-specific';
import { Point } from '@app/interfaces/point';
export class DrawRectangleCommand extends CommandSpecific {
    coords: [number, number, number, number];
    color: string;
    rectangleIsSquare: boolean;
    oldPointsColor: [ImageData, number, number];
    saved = false;
    // eslint-disable-next-line max-params
    constructor(firstPoint: Point, lastPoint: Point, color: string, isSquare: boolean, canvas: ElementRef<HTMLCanvasElement>, canvasName: string) {
        super(canvas, canvasName);
        if (isSquare) {
            this.coords = this.getCoordsSquare(firstPoint, lastPoint);
        } else {
            const minX = Math.floor(Math.min(firstPoint.x, lastPoint.x));
            const maxX = Math.ceil(Math.max(firstPoint.x, lastPoint.x));

            const minY = Math.floor(Math.min(firstPoint.y, lastPoint.y));
            const maxY = Math.ceil(Math.max(firstPoint.y, lastPoint.y));

            this.coords = [minX, minY, maxX - minX, maxY - minY];
        }
        this.color = color;
        this.rectangleIsSquare = isSquare;
    }

    do(saveForUndo = true): void {
        const ctx = this.ctx;
        if (saveForUndo) this.oldPointsColor = this.saveRectangleData();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.coords[0], this.coords[1], this.coords[2], this.coords[3]);
    }

    undo(): void {
        this.restoreRectangleData.apply(this, this.oldPointsColor);
    }

    private saveRectangleData(): [ImageData, number, number] {
        if (this.coords[0] > 0 && this.coords[1] > 0 && this.coords[2] > 0 && this.coords[3] > 0) {
            // I don't know why but the rectangle is not saved correctly without this gap
            const gap = 10;
            const x = Math.max(0, this.coords[0] - gap);
            const y = Math.max(0, this.coords[1] - gap);
            // also the size of the rectangle is not correct without this gap
            const imageData = this.ctx.getImageData(x, y, this.coords[2] + gap * 2, this.coords[3] + gap * 2);
            this.saved = true;
            return [imageData, x, y];
        }
        return [new ImageData(0, 0), 0, 0];
    }

    private restoreRectangleData(imageData: ImageData, minX: number, minY: number): void {
        if (!this.saved) return;

        const ctx = this.ctx;
        ctx.beginPath();
        ctx.putImageData(imageData, minX, minY);
        ctx.closePath();
    }

    private getCoordsSquare(firstPoint: Point, lastPoint: Point): [number, number, number, number] {
        const width = Math.abs(lastPoint.x - firstPoint.x);
        const height = Math.abs(lastPoint.y - firstPoint.y);
        const size = Math.max(width, height);
        const minX = Math.min(lastPoint.x, firstPoint.x);
        const minY = Math.min(lastPoint.y, firstPoint.y);

        return [minX, minY, size, size];
    }
}
