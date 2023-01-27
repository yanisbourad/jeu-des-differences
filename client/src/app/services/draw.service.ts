import { Injectable } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';
import { Point } from '@app/interfaces/point';

@Injectable({
    providedIn: 'root',
})
export class DrawService {
    context: CanvasRenderingContext2D;
    private canvasSize: Point = { x: constants.defaultWidth, y: constants.defaultHeight };
    private color: string = 'black';
    private lineWidth: number = 3;

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    set setColor(color: string) {
        this.color = color;
    }

    set setLineWidth(width: number) {
        this.lineWidth = width;
    }

    drawImage(image: ImageBitmap, canvas: HTMLCanvasElement): void {
        this.context = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.context.drawImage(image, 0, 0, this.width, this.height);
    }

    drawVec(point: Point, lastPoint: Point, canvas: HTMLCanvasElement): void {
        this.context = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.context.beginPath();
        this.context.moveTo(lastPoint.x, lastPoint.y);
        this.context.lineTo(point.x, point.y);
        this.context.strokeStyle = this.color;
        this.context.lineWidth = this.lineWidth;
        this.context.stroke();
    }
    // drawLine(linePoints: Vec2[], canvas: HTMLCanvasElement) {}

    // drawCube(cubePoints: Vec2[], canvas: HTMLCanvasElement) {}

    // drawTriangle(canvas: HTMLCanvasElement) {}

    clearCanvas(canvas: HTMLCanvasElement) {
        this.context = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.context.clearRect(0, 0, this.width, this.height);
    }
    validateDrawing(selectedRadius: number) {
        // TODO: check if the drawing is valid
        return selectedRadius ? true : false;
    }
}
