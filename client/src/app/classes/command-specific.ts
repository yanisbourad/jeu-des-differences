import { ElementRef } from '@angular/core';
import { Point } from '@app/interfaces/point';
const NBR_PIXELS_SQUARE = 10;
// this is the base class for all the commands regards to drawing
// it contains all the methods that are common to all the drawing commands
// it is abstract because it is not meant to be instantiated

// there is only the constructor and the do and undo methods that should be public

// for saving last canvas state, we will divide the canvas in squares of 50x50 pixels
// and save the data of each square that is modified

export abstract class CommandSpecific {
    canvas: ElementRef<HTMLCanvasElement>;
    canvasName: string;
    constructor(canvas: ElementRef<HTMLCanvasElement>, canvasName: string) {
        this.canvasName = canvasName;
        this.canvas = canvas;
    }

    protected get canvasElement(): HTMLCanvasElement {
        return this.canvas.nativeElement;
    }

    protected get ctx(): CanvasRenderingContext2D {
        return this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }

    protected get width(): number {
        return this.canvas.nativeElement.width;
    }

    protected get height(): number {
        return this.canvas.nativeElement.height;
    }

    clearCanvas(canvas: ElementRef<HTMLCanvasElement>): void {
        const context = canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        context.clearRect(0, 0, this.width, this.height);
    }

    protected getScreenShot(canvasOld: ElementRef<HTMLCanvasElement>): string {
        return canvasOld.nativeElement.toDataURL();
    }

    protected putsCanvasData(canvas: ElementRef<HTMLCanvasElement>, data: string): void {
        const img = new Image();
        img.src = data;
        const ctx = canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        img.onload = () => ctx.drawImage(img, 0, 0);
    }

    protected saveLineOldColors(points: Point[], lineWidth: number): Map<string, ImageData> {
        const squares = this.getSquareList(points, lineWidth);
        const oldPointsColor = new Map<string, ImageData>();
        for (const square of squares) {
            this.saveLastCanvasState(square.x, square.y, oldPointsColor);
        }
        return oldPointsColor;
    }

    // function that will take a list of points and return a list of 50x50 squares that the line are in
    protected getSquareList(points: Point[], lineWidth: number): Point[] {
        const setKeys = new Set<string>();
        const returnList: Point[] = [];
        for (let i = 1; i < points.length; i++) {
            const lastPoint = points[i - 1];
            const point = points[i];
            const minX = Math.min(lastPoint.x, point.x) - lineWidth * 2;
            const maxX = Math.max(lastPoint.x, point.x) + lineWidth * 2;
            const minY = Math.min(lastPoint.y, point.y) - lineWidth * 2;
            const maxY = Math.max(lastPoint.y, point.y) + lineWidth * 2;
            for (let j = minX; j <= maxX; j += NBR_PIXELS_SQUARE) {
                for (let k = minY; k <= maxY; k += NBR_PIXELS_SQUARE) {
                    if (!setKeys.has(`${Math.round(j / NBR_PIXELS_SQUARE)},${Math.round(k / NBR_PIXELS_SQUARE)}`)) {
                        setKeys.add(`${Math.round(j / NBR_PIXELS_SQUARE)},${Math.round(k / NBR_PIXELS_SQUARE)}`);
                        returnList.push({ x: Math.round(j / NBR_PIXELS_SQUARE), y: Math.round(k / NBR_PIXELS_SQUARE) });
                    }
                }
            }
        }
        return returnList;
    }

    // for saving last canvas state, we will divide the canvas in squares of 50x50 pixels
    // and save the data of each square that is modified
    protected saveLastCanvasState(i: number, j: number, lastCanvasState: Map<string, ImageData>): void {
        const ctx = this.ctx;
        const x = Math.round(i * NBR_PIXELS_SQUARE);
        const y = Math.round(j * NBR_PIXELS_SQUARE);
        const imageData = ctx.getImageData(x, y, NBR_PIXELS_SQUARE, NBR_PIXELS_SQUARE);
        lastCanvasState.set(`${x},${y}`, imageData);
    }

    protected restoreLastCanvasState(lastCanvasState: Map<string, ImageData>): void {
        const ctx = this.ctx;
        for (const keys of lastCanvasState.keys()) {
            const [x, y] = keys.split(',').map((key) => parseInt(key, 10));
            const imageData = lastCanvasState.get(keys);
            if (imageData) {
                ctx.putImageData(imageData, x, y);
            }
        }
    }

    abstract do(saveForUndo: boolean): void;
    abstract undo(): void;
}
