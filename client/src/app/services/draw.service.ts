import { Injectable } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';
import * as keys from '@app/configuration/const-hotkeys';
import * as styler from '@app/configuration/const-styler-type';
import { Point } from '@app/interfaces/point';
import { Vec2 } from '@app/interfaces/vec2';
import { HotkeysService } from './hotkeys.service';
@Injectable({
    providedIn: 'root',
})
export class DrawService {
    private canvasSize: Point = { x: constants.DEFAULT_WIDTH, y: constants.DEFAULT_HEIGHT };
    private color: string = constants.DEFAULT_LINE_COLOR;
    private lineWidth: number = constants.DEFAULT_LINE_WIDTH;
    private rectangleIsSquare: boolean = false;
    private tool: string = styler.PEN;
    constructor(private readonly hotkeysService: HotkeysService) {
        this.hotkeysService.hotkeysEventListener([keys.SHIFT], false, this.setIsRectangle.bind(this));
        this.hotkeysService.hotkeysEventListener([keys.SHIFT], true, this.setIsSquare.bind(this));
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

    static drawAllDiff(differences: Set<number>[], canvas: HTMLCanvasElement) {
        differences.forEach((diff) => {
            this.drawDiff(diff, canvas);
        });
    }

    static drawDiff(diff: Set<number>, canvas: HTMLCanvasElement, color: string = constants.DEFAULT_LINE_COLOR): void {
        const context = this.getContext(canvas);
        // color pixels one by one and draw them
        diff.forEach((index) => {
            const x = index % constants.DEFAULT_WIDTH;
            const y = Math.floor(index / constants.DEFAULT_WIDTH);
            context.fillStyle = color;
            context.fillRect(x, y, 1, 1);
        });
    }

    static clearCanvas(canvas: HTMLCanvasElement) {
        const context = this.getContext(canvas);
        context.fillStyle = constants.DEFAULT_BACKGROUND_COLOR;
        context.fillRect(0, 0, constants.DEFAULT_WIDTH, constants.DEFAULT_HEIGHT);
    }

    static clearDiff(canvas: HTMLCanvasElement) {
        const context = this.getContext(canvas);
        // make it transparent
        context.fillStyle = constants.DEFAULT_BACKGROUND_COLOR;
        context.clearRect(0, 0, constants.DEFAULT_WIDTH, constants.DEFAULT_HEIGHT);
    }

    static getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
        const context = canvas.getContext('2d', CanvasRenderingContext2D) as CanvasRenderingContext2D;
        return context;
    }

    static drawWord(word: string, canvas: HTMLCanvasElement, position: Vec2): void {
        const context = this.getContext(canvas);
        context.font = '25px system-ui';
        context.fillStyle = 'red';
        context.fillText(word, position.x, position.y);
    }

    setIsSquare(): void {
        this.rectangleIsSquare = true;
    }

    setIsRectangle(): void {
        this.rectangleIsSquare = false;
    }
}
