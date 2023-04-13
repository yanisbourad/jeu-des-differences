import { EventEmitter, Injectable } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/configuration/const-canvas';
import * as keys from '@app/configuration/const-hotkeys';
import * as styler from '@app/configuration/const-styler-type';
import { Point } from '@app/interfaces/point';
import { Vec2 } from '@app/interfaces/vec2';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
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

    static getImageDateFromDataUrl(dataUrl: string): EventEmitter<ImageData> {
        const obs: EventEmitter<ImageData> = new EventEmitter<ImageData>();
        const image = new Image();
        image.src = dataUrl;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = DEFAULT_WIDTH;
            canvas.height = DEFAULT_HEIGHT;
            const context = canvas.getContext('2d') as CanvasRenderingContext2D;
            context.drawImage(image, 0, 0);
            canvas.remove();
            obs.next(context.getImageData(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT));
        };
        return obs;
    }
    // eslint-disable-next-line max-params
    static drawDiff(
        diff: Set<number>,
        canvas: HTMLCanvasElement,
        color: string = constants.DEFAULT_LINE_COLOR,
        originalImage: ImageData | undefined = undefined,
    ): void {
        const context = this.getContext(canvas);

        if (originalImage) {
            diff.forEach((index) => {
                const x = index % constants.DEFAULT_WIDTH;
                const y = Math.floor(index / constants.DEFAULT_WIDTH);
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                const pixelIndex = (y * constants.DEFAULT_WIDTH + x) * 4;
                const red = originalImage.data[pixelIndex];
                const green = originalImage.data[pixelIndex + 1];
                const blue = originalImage.data[pixelIndex + 2];
                const alpha = originalImage.data[pixelIndex + 3];
                context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
                context.fillRect(x, y, 1, 1);
            });
        } else {
            // color pixels one by one and draw them
            diff.forEach((index) => {
                const x = index % constants.DEFAULT_WIDTH;
                const y = Math.floor(index / constants.DEFAULT_WIDTH);
                context.fillStyle = color;
                context.fillRect(x, y, 1, 1);
            });
        }
    }

    static drawImage(image: ImageData, canvas: HTMLCanvasElement): void {
        const context = DrawService.getContext(canvas);
        context.putImageData(image, 0, 0);
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
