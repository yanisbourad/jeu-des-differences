import { Injectable } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';
import { Point } from '@app/interfaces/point';
import { Vec2 } from '@app/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class DrawService {
    private canvasSize: Point = { x: constants.DEFAULT_WIDTH, y: constants.DEFAULT_HEIGHT };
    private color: string = constants.DEFAULT_LINE_COLOR;
    private lineWidth: number = constants.DEFAULT_LINE_WIDTH;

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
        context?.drawImage(image, 0, 0, constants.DEFAULT_WIDTH, constants.DEFAULT_HEIGHT);
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
        context.fillStyle = constants.DEFAULT_BACKGROUND_COLOR;
        context.fillRect(0, 0, this.width, this.height);
    }

    clearDiff(canvas: HTMLCanvasElement) {
        const context = this.getContext(canvas);
        context.clearRect(0, 0, this.width, this.height);
    }

    getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
        const context = canvas.getContext('2d', CanvasRenderingContext2D) as CanvasRenderingContext2D;
        return context;
    }

    drawWord(word: string, canvas: HTMLCanvasElement, position: Vec2): void {
        const context = this.getContext(canvas);
        context.font = '20px system-ui';
        context.fillStyle = 'red';
        context.fillText(word, position.x, position.y);
    }
}
