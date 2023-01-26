import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Drawing } from '@app/interfaces/drawing';
import { Point } from '@app/interfaces/point';
import { BitmapService } from '@app/services/bitmap.service';
import { DrawService } from '@app/services/draw.service';

@Component({
    selector: 'app-canvas-ngx',
    templateUrl: './canvas-ngx.component.html',
    styleUrls: ['./canvas-ngx.component.scss'],
})
export class CanvasNgxComponent implements AfterViewInit {
    @ViewChild('Canvas1', { static: false }) private canvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('Canvas2', { static: false }) private canvas2!: ElementRef<HTMLCanvasElement>; // added by renel

    listDraw: Drawing[] = [];
    originalImage: ImageBitmap;
    modifiedImage: ImageBitmap; // added by renel

    isDrawing = false;
    currentDrawing: Drawing = { points: [] };

    // TODO : Avoir un fichier séparé pour les constantes!
    readonly DEFAULT_WIDTH = 640;
    readonly DEFAULT_HEIGHT = 480;

    constructor(private readonly drawService: DrawService, private readonly bitmap: BitmapService) {}

    ngAfterViewInit(): void {
        this.canvas.nativeElement.addEventListener('mousedown', (e: MouseEvent) => {
            this.mouseHitDetection(e);
        });
        this.canvas2.nativeElement.addEventListener('mousedown', (e: MouseEvent) => {
            this.mouseHitDetection(e);
        });
    }

    onFileSelected(e: Event): void {
        this.bitmap
            .fileToImageBitmap(this.bitmap.getFile(e))
            .then((img: ImageBitmap) => {
                this.originalImage = img;
                this.drawService.drawImage(img, this.canvas.nativeElement);
            })
            .catch((err) => {
                alert(err);
            });
    }

    onFileSelected2(e: Event): void {
        // duplicata added for modified
        this.bitmap
            .fileToImageBitmap(this.bitmap.getFile(e))
            .then((img: ImageBitmap) => {
                this.modifiedImage = img;
                this.drawService.drawImage(img, this.canvas2.nativeElement);
            })
            .catch((err) => {
                alert(err);
            });
    }

    getPoint(e: MouseEvent): Point | undefined {
        const it = this.canvas.nativeElement.getBoundingClientRect();
        const x: number = e.clientX - it.left;
        const y: number = e.clientY - it.top;
        if (x < 0 || x > it.right || y < 0 || y > it.bottom) {
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
        if (this.isDrawing) {
            const point: Point | undefined = this.getPoint(e);
            if (point === undefined) {
                return;
            }
            this.drawService.drawVec(point, this.getLastPoint(), this.canvas.nativeElement);
            this.currentDrawing.points.push(point);
        }
    }

    mouseUpDetection(): void {
        this.canvas.nativeElement.removeEventListener('mousemove', (e) => {
            this.mouseMoveDetection(e);
        });
        this.canvas.nativeElement.removeEventListener('mouseup', () => {
            this.mouseUpDetection();
        });
        this.isDrawing = false;
        this.listDraw.push(this.currentDrawing);
        this.currentDrawing = { points: [] };
    }

    // read image data from canvas

    printData() {
        console.log(this.bitmap.generatePixelMatrices(this.canvas.nativeElement).length);
        console.log(this.bitmap.generatePixelMatrices(this.canvas2.nativeElement));
    }
}
