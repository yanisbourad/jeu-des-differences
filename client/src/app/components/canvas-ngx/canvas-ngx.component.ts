import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';
import { Drawing } from '@app/interfaces/drawing';
import { Point } from '@app/interfaces/point';
import { BitmapService } from '@app/services/bitmap.service';
import { CanvasHolderService } from '@app/services/canvas-holder.service';
import { DrawService } from '@app/services/draw.service';
@Component({
    selector: 'app-canvas-ngx',
    templateUrl: './canvas-ngx.component.html',
    styleUrls: ['./canvas-ngx.component.scss'],
})
export class CanvasNgxComponent implements AfterViewInit {
    @ViewChild('Canvas', { static: false }) private canvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('fileUpload', { static: false }) private fileUpload!: ElementRef<HTMLInputElement>;
    @Input() private type!: string;
    listDraw: Drawing[] = [];
    isDrawing = false;
    currentDrawing: Drawing = { points: [] };

    constructor(
        private readonly drawService: DrawService,
        private readonly bitmap: BitmapService,
        private readonly canvasHolderService: CanvasHolderService,
    ) {}

    // needed for the canvas size
    get width(): number {
        return constants.defaultWidth;
    }
    get height(): number {
        return constants.defaultHeight;
    }
    ngAfterViewInit(): void {
        this.canvas.nativeElement.addEventListener('mousedown', (e: MouseEvent) => {
            this.mouseHitDetection(e);
        });
        // push the canvas pointer to the difference Service
        this.canvasHolderService.setCanvas(this.canvas, this.type);
    }

    async onFileSelected(e: Event) {
        const newImage = await this.bitmap.fileToImageBitmap(this.bitmap.getFile(e));
        this.drawService.drawImage(newImage, this.canvas.nativeElement);
        this.fileUpload.nativeElement.value = '';
    }

    getPoint(e: MouseEvent): Point | undefined {
        const canvasBound = this.canvas.nativeElement.getBoundingClientRect();
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
        if (point === undefined) {
            this.isDrawing = false;
            return;
        }
        this.currentDrawing.points.push(point);
        this.canvas.nativeElement.addEventListener('mousemove', (event: MouseEvent) => {
            this.mouseMoveDetection(event);
        });
        this.canvas.nativeElement.addEventListener('mouseup', () => {
            this.mouseUpDetection();
        });
    }

    mouseMoveDetection(e: MouseEvent): void {
        if (!this.isDrawing) return;
        {
            const point: Point | undefined = this.getPoint(e);
            if (point !== undefined) {
                this.drawService.drawVec(point, this.getLastPoint(), this.canvas.nativeElement);
                this.currentDrawing.points.push(point);
            }
        }
    }

    mouseUpDetection(): void {
        this.isDrawing = false;
        this.listDraw.push(this.currentDrawing);
        this.currentDrawing.points = new Array<Point>();
        this.canvas.nativeElement.removeEventListener('mousemove', (e) => {
            this.mouseMoveDetection(e);
        });
        this.canvas.nativeElement.removeEventListener('mouseup', () => {
            this.mouseUpDetection();
        });
    }
    clearCanvas(): void {
        this.drawService.clearCanvas(this.canvas.nativeElement);
    }
}
