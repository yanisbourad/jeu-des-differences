import { Injectable } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';
import { Point } from '@app/interfaces/point';
import { Vec2 } from '@app/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class DrawService {
    private canvasSize: Point = { x: constants.defaultWidth, y: constants.defaultHeight };
    private color: string = 'black';
    private lineWidth: number = 3;

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

    set setColor(color: string) {
        this.color = color;
    }

    set setLineWidth(width: number) {
        this.lineWidth = width;
    }

    drawImage(image: ImageBitmap, canvas: HTMLCanvasElement): void {
        const context = this.getContext(canvas);
        context.drawImage(image, 0, 0, this.width, this.height);
    }

    drawFromData(data: Uint8ClampedArray, canvas: HTMLCanvasElement): void {
        const context = this.getContext(canvas);
        const imageData = new ImageData(data, this.width, this.height);
        context.putImageData(imageData, 0, 0);
    }

    drawVec(point: Point, lastPoint: Point, canvas: HTMLCanvasElement): void {
        const context = this.getContext(canvas);
        context.beginPath();
        context.moveTo(lastPoint.x, lastPoint.y);
        context.lineTo(point.x, point.y);
        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;
        context.stroke();
    }

    drawLine(point: Point, lastPoint: Point, canvas: HTMLCanvasElement): void {
        const context = this.getContext(canvas);
        context.beginPath();
        context.moveTo(lastPoint.x, lastPoint.y);
        context.lineTo(point.x, point.y);
        // do a circular cap on the line
        context.lineCap = 'round';
        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;
        context.stroke();
    }
    // drawLine(linePoints: Vec2[], canvas: HTMLCanvasElement) {}

    // drawCube(cubePoints: Vec2[], canvas: HTMLCanvasElement) {}

    // drawTriangle(canvas: HTMLCanvasElement) {}

    clearCanvas(canvas: HTMLCanvasElement) {
        const context = this.getContext(canvas);
        context.clearRect(0, 0, this.width, this.height);
    }
    validateDrawing(selectedRadius: number) {
        // TODO: check if the drawing is valid
        return selectedRadius ? true : false;
    }
    getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
        return canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    drawWords(word: string, canvas: HTMLCanvasElement, position: Vec2): void {
        const context = this.getContext(canvas);
        context.font = '20px system-ui';
        context.fillStyle = 'red';
        context.fillText(word, position.x, position.y);
    }
}
