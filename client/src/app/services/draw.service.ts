import { Injectable } from '@angular/core';
import { Point } from '@app/interfaces/point';

// TODO : Avoir un fichier séparé pour les constantes et ne pas les répéter!
export const DEFAULT_WIDTH = 640;
export const DEFAULT_HEIGHT = 480;

@Injectable({
    providedIn: 'root',
})
export class DrawService {
    context: CanvasRenderingContext2D;
    private canvasSize: Point = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
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

    // drowCube(cubePoints: Vec2[], canvas: HTMLCanvasElement) {}

    // drawTriangle(canvas: HTMLCanvasElement) {}

    // clear(canvas: HTMLCanvasElement) {}
}
