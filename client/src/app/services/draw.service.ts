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

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    drawImage(image: ImageBitmap, canvas: HTMLCanvasElement) {
        this.context = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.context.drawImage(image, 0, 0, this.width, this.height);
    }

    drawVec(point: Point, lastPoint: Point, canvas: HTMLCanvasElement) {
        this.context = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.context.beginPath();
        this.context.moveTo(lastPoint.x, lastPoint.y);
        this.context.lineTo(point.x, point.y);
        this.context.strokeStyle = 'blue';
        this.context.lineWidth = 2;
        this.context.stroke();
    }
    // drawLine(linePoints: Vec2[], canvas: HTMLCanvasElement) {}

    // clear(canvas: HTMLCanvasElement) {}
}
