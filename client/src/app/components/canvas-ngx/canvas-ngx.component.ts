import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';
import { BitmapService } from '@app/services/bitmap.service';
import { CanvasHolderService } from '@app/services/canvas-holder.service';
import { DrawService } from '@app/services/draw.service';
@Component({
    selector: 'app-canvas-ngx',
    templateUrl: './canvas-ngx.component.html',
    styleUrls: ['./canvas-ngx.component.scss'],
})
export class CanvasNgxComponent implements AfterViewInit {
    @Input() type!: string;
    @ViewChild('Canvas', { static: false }) private canvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('fileUpload', { static: false }) private fileUpload!: ElementRef<HTMLInputElement>;

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

    get canvasNative(): HTMLCanvasElement {
        return this.canvas.nativeElement;
    }
    ngAfterViewInit(): void {
        this.drawService.clearCanvas(this.canvas.nativeElement);
        this.saveCanvas();
    }

    loadImage(img: ImageBitmap) {
        this.drawService.drawImage(img, this.canvas.nativeElement);
        this.saveCanvas();
    }

    async onFileSelected(e: Event) {
        const image = await this.bitmap.handleFileSelect(e);
        if (image) this.loadImage(image);
        this.fileUpload.nativeElement.value = '';
    }

    saveCanvas(): void {
        const ctx = this.canvasNative.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
        const imageData = ctx.getImageData(0, 0, constants.defaultWidth, constants.defaultHeight);
        const canvasData = imageData.data;
        const canvasDataStr = ctx.canvas.toDataURL('image/bmp');
        if (canvasData) this.canvasHolderService.setCanvas(canvasData, this.type);
        if (canvasDataStr) this.canvasHolderService.setCanvasData(canvasDataStr, this.type);
    }

    clearCanvas(): void {
        this.drawService.clearCanvas(this.canvas.nativeElement);
        this.saveCanvas();
    }
}
