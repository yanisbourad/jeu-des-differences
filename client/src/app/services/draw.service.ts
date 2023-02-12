import { Injectable } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';
import { Point } from '@app/interfaces/point';
import { Vec2 } from '@app/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class DrawService {
    private canvasSize: Point = { x: constants.defaultWidth, y: constants.defaultHeight };
    private color: string = constants.defaultLineColor;
    private lineWidth: number = constants.defaultLineWidth;

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
        context.drawImage(image, 0, 0, constants.defaultWidth, constants.defaultHeight);
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

    clearCanvas(canvas: HTMLCanvasElement) {
        const context = this.getContext(canvas);
        context.fillStyle = constants.defaultBackgroundColor;
        context.fillRect(0, 0, this.width, this.height);
    }

    clearDiff(canvas: HTMLCanvasElement) {
        const context = this.getContext(canvas);
        context.clearRect(0, 0, this.width, this.height);
    }

    getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
        return canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    drawWord(word: string, canvas: HTMLCanvasElement, position: Vec2): void {
        const context = this.getContext(canvas);
        context.font = '20px system-ui';
        context.fillStyle = 'red';
        context.fillText(word, position.x, position.y);
    }
}
