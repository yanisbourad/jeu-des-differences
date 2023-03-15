import { Injectable } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';
import * as styler from '@app/configuration/const-styler-type';
import { Drawing } from '@app/interfaces/drawing';
import { Point } from '@app/interfaces/point';
import { Vec2 } from '@app/interfaces/vec2';
@Injectable({
    providedIn: 'root',
})
export class DrawService {
    private canvasSize: Point = { x: constants.DEFAULT_WIDTH, y: constants.DEFAULT_HEIGHT };
    private color: string = constants.DEFAULT_LINE_COLOR;
    private lineWidth: number = constants.DEFAULT_LINE_WIDTH;
    private rectangleIsSquare: boolean = false;
    private tool: string = styler.PEN;
    constructor() {
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Shift') {
                this.rectangleIsSquare = true;
            }
        });

        document.addEventListener('keyup', (event: KeyboardEvent) => {
            if (event.key === 'Shift') {
                this.rectangleIsSquare = false;
            }
        });
    }

    get usedTool(): string {
        return this.tool;
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    get getColor(): string {
        return this.color;
    }

    get getLineWidth(): number {
        return this.lineWidth;
    }

    get getRectangleIsSquare(): boolean {
        return this.rectangleIsSquare;
    }

    set setTool(tool: string) {
        this.tool = tool;
    }

    set setColor(color: string) {
        this.color = color;
    }

    set setLineWidth(width: number) {
        this.lineWidth = width;
    }

    set setRectangleIsSquare(isSquare: boolean) {
        this.rectangleIsSquare = isSquare;
    }

    drawImage(image: ImageBitmap, canvas: HTMLCanvasElement): void {
        const context = this.getContext(canvas);
        context.drawImage(image, 0, 0, constants.DEFAULT_WIDTH, constants.DEFAULT_HEIGHT);
    }

    drawDataUrl(dataUrl: string, canvas: HTMLCanvasElement): void {
        const context = this.getContext(canvas);
        const img = new Image();
        img.onload = () => {
            context.drawImage(img, 0, 0);
        };
    }

    drawImageOnMultipleCanvas(image: ImageBitmap, canvas1: HTMLCanvasElement, canvas2: HTMLCanvasElement): void {
        this.drawImage(image, canvas1);
        this.drawImage(image, canvas2);
    }

    drawAllDiff(differences: Set<number>[], canvas: HTMLCanvasElement) {
        differences.forEach((diff) => {
            this.drawDiff(diff, canvas);
        });
    }

    drawDiff(diff: Set<number>, canvas: HTMLCanvasElement): void {
        const context = this.getContext(canvas);
        // color pixels one by one and draw them
        diff.forEach((index) => {
            const x = index % this.width;
            const y = Math.floor(index / this.width);
            context.fillStyle = this.color;
            context.fillRect(x, y, 1, 1);
        });
    }

    getCoordsSquare(firstPoint: Point, lastPoint: Point): [number, number, number, number] {
        const width = Math.abs(lastPoint.x - firstPoint.x);
        const height = Math.abs(lastPoint.y - firstPoint.y);
        const size = Math.max(width, height);
        if (lastPoint.x < firstPoint.x) {
            if (lastPoint.y < firstPoint.y) {
                return [firstPoint.x - size, firstPoint.y - size, size, size];
            } else {
                return [firstPoint.x - size, firstPoint.y, size, size];
            }
        } else {
            if (lastPoint.y < firstPoint.y) {
                return [firstPoint.x, firstPoint.y - size, size, size];
            } else {
                return [firstPoint.x, firstPoint.y, size, size];
            }
        }
    }

    drawLine(point: Point, lastPoint: Point, canvas: HTMLCanvasElement): void {
        const context = this.getContext(canvas);
        context.beginPath();
        context.moveTo(lastPoint.x, lastPoint.y);
        context.lineTo(point.x, point.y);
        context.lineCap = constants.DEFAULT_LINE_CAP;
        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;
        context.stroke();
    }

    clearCanvas(canvas: HTMLCanvasElement) {
        const context = this.getContext(canvas);
        context.fillStyle = constants.DEFAULT_BACKGROUND_COLOR;
        context.fillRect(0, 0, this.width, this.height);
    }

    clearDiff(canvas: HTMLCanvasElement) {
        const context = this.getContext(canvas);
        // make it transparent
        context.fillStyle = constants.DEFAULT_BACKGROUND_COLOR;
        context.clearRect(0, 0, this.width, this.height);
    }

    getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
        const context = canvas.getContext('2d', CanvasRenderingContext2D) as CanvasRenderingContext2D;
        return context;
    }

    drawListLine(drawing: Drawing, nativeElement: HTMLCanvasElement) {
        if (drawing.points.length <= 1) return;
        for (let i = 1; i < drawing.points.length; i++) {
            this.drawLine(drawing.points[i], drawing.points[i - 1], nativeElement);
        }
    }
    drawWord(word: string, canvas: HTMLCanvasElement, position: Vec2): void {
        const context = this.getContext(canvas);
        context.font = '20px system-ui';
        context.fillStyle = 'red';
        context.fillText(word, position.x, position.y);
    }
}
