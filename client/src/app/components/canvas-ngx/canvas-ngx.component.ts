import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommandSpecific } from '@app/classes/command-specific';
import { DrawErasLineCommand } from '@app/classes/commands/draw-eras-command';
import { DrawImageCommand } from '@app/classes/commands/draw-image-command';
import { DrawListLineCommand } from '@app/classes/commands/draw-list-line-command';
import { DrawRectangleCommand } from '@app/classes/commands/draw-rectangle-command';
import * as constants from '@app/configuration/const-canvas';
import * as stylers from '@app/configuration/const-styler-type';
import { Drawing } from '@app/interfaces/drawing';
import { Point } from '@app/interfaces/point';
import { BitmapService } from '@app/services/bitmap.service';
import { CanvasHolderService } from '@app/services/canvas-holder.service';
import { CommandService } from '@app/services/command.service';
import { DrawService } from '@app/services/draw.service';
@Component({
    selector: 'app-canvas-ngx',
    templateUrl: './canvas-ngx.component.html',
    styleUrls: ['./canvas-ngx.component.scss'],
})
export class CanvasNgxComponent implements AfterViewInit {
    @Input() type!: string;
    @ViewChild('CanvasImage', { static: false }) private canvasImage!: ElementRef<HTMLCanvasElement>;
    @ViewChild('CanvasDraw', { static: false }) private canvasDraw!: ElementRef<HTMLCanvasElement>;
    @ViewChild('CanvasTemp', { static: false }) private canvasTemp!: ElementRef<HTMLCanvasElement>;
    @ViewChild('fileUpload', { static: false }) private fileUpload!: ElementRef<HTMLInputElement>;
    tempCommand: CommandSpecific | undefined;
    listDraw: Drawing[] = [];
    isDrawing = false;
    currentDrawing: Drawing = { points: [] };

    // eslint-disable-next-line max-params
    constructor(
        private readonly drawService: DrawService,
        private readonly bitmap: BitmapService,
        private readonly canvasHolderService: CanvasHolderService,
        private readonly commandService: CommandService,
    ) {}

    // needed for the canvas size
    get width(): number {
        return constants.DEFAULT_WIDTH;
    }
    get height(): number {
        return constants.DEFAULT_HEIGHT;
    }

    get canvasNative(): HTMLCanvasElement {
        return this.canvasImage.nativeElement;
    }

    get styler(): string {
        return this.drawService.usedTool;
    }

    ngAfterViewInit(): void {
        this.canvasDraw.nativeElement.addEventListener('mousedown', (e: MouseEvent) => {
            this.mouseHitDetection(e);
        });
        this.canvasDraw.nativeElement.addEventListener('mousemove', (event: MouseEvent) => {
            this.mouseMoveDetection(event);
        });
        this.canvasDraw.nativeElement.addEventListener('mouseup', () => {
            this.mouseUpDetection();
        });
        this.clearCanvas();
    }

    loadImage(img: ImageBitmap) {
        const command = new DrawImageCommand(img, this.canvasImage);
        this.commandService.do(command);
    }

    async onFileSelected(e: Event) {
        const image = await this.bitmap.handleFileSelect(e);
        if (image) this.loadImage(image);
        this.fileUpload.nativeElement.value = '';
    }

    getPoint(e: MouseEvent): Point | undefined {
        const canvasBound = this.canvasDraw.nativeElement.getBoundingClientRect();
        const x: number = e.clientX - canvasBound.left;
        const y: number = e.clientY - canvasBound.top;
        if (x < 0 || x > canvasBound.right || y < 0 || y > canvasBound.bottom) {
            return undefined;
        }
        return { x, y };
    }

    getLastPoint(): Point {
        return this.currentDrawing.points[this.currentDrawing.points.length - 1];
    }

    mouseHitDetection(e: MouseEvent): void {
        this.isDrawing = true;
        const point = this.getPoint(e);
        if (!point) {
            this.isDrawing = false;
            return;
        }
        this.currentDrawing.points.push(point);
    }

    mouseMoveDetection(e: MouseEvent): void {
        if (!this.isDrawing) return;
        const point: Point | undefined = this.getPoint(e);
        if (point !== undefined) {
            this.currentDrawing.points.push(point);
            this.doTempCommand();
        } else {
            this.mouseUpDetection();
        }
    }

    doTempCommand(saveTheCommand = false): void {
        this.tempCommand?.undo();
        switch (this.styler) {
            case stylers.PEN:
                this.tempCommand = new DrawListLineCommand(
                    this.currentDrawing.points,
                    this.drawService.getColor,
                    this.drawService.getLineWidth,
                    this.canvasDraw,
                );
                break;

            case stylers.ERASER:
                this.tempCommand = new DrawErasLineCommand(this.currentDrawing.points, this.drawService.getLineWidth, this.canvasDraw);
                break;

            case stylers.RECTANGLE:
                this.tempCommand = new DrawRectangleCommand(
                    this.currentDrawing.points[0],
                    this.getLastPoint(),
                    this.drawService.getColor,
                    this.drawService.getRectangleIsSquare,
                    this.canvasDraw,
                );
                break;

            default:
                break;
        }
        if (saveTheCommand && this.tempCommand) {
            this.commandService.do(this.tempCommand);
            this.tempCommand = undefined;
            // this.saveCanvas();
        } else this.tempCommand?.do(true);
    }

    mouseUpDetection(): void {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.doTempCommand(true);

        this.listDraw.push(this.currentDrawing);
        this.currentDrawing = { points: [] };
    }

    saveCanvas(): void {
        const canvasImage = this.canvasImage.nativeElement;
        const canvasDraw = this.canvasDraw.nativeElement;
        const ctx = this.canvasTemp.nativeElement.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        ctx.drawImage(canvasImage, 0, 0);
        ctx.drawImage(canvasDraw, 0, 0);
        const imageData = ctx.getImageData(0, 0, constants.DEFAULT_WIDTH, constants.DEFAULT_HEIGHT);
        const canvasData = imageData.data;
        const canvasDataStr = ctx.canvas.toDataURL('image/bmp');
        if (canvasData) this.canvasHolderService.setCanvas(canvasData, this.type);
        if (canvasDataStr) this.canvasHolderService.setCanvasData(canvasDataStr, this.type);
    }

    clearCanvas(): void {
        this.drawService.clearCanvas(this.canvasImage.nativeElement);
        this.drawService.clearDiff(this.canvasDraw.nativeElement);
        this.saveCanvas();
    }

    clearCanvasDraw(): void {
        this.drawService.clearDiff(this.canvasDraw.nativeElement);
        this.saveCanvas();
    }
}
