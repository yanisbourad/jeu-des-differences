import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ImageDiffService {
    test: string = 'test';
    // Get the canvas elements
    originalCanvas = document.getElementById('original-img-canvas') as HTMLCanvasElement;
    modifiedCanvas = document.getElementById('modified-img-canvas') as HTMLCanvasElement;

    // Get the 2D rendering context
    ctxOriginal: CanvasRenderingContext2D | null = this.originalCanvas.getContext('2d');
    ctxModified: CanvasRenderingContext2D | null = this.modifiedCanvas.getContext('2d');

    originalImageData: ImageData | undefined = this.ctxOriginal?.getImageData(0, 0, this.originalCanvas.width, this.originalCanvas.height);
    modifiedImageData: ImageData | undefined = this.ctxModified?.getImageData(0, 0, this.modifiedCanvas.width, this.modifiedCanvas.height);

    originalImagePixelMatrix: number[];
    modifiedImagePixelMatrix: number[];
}
