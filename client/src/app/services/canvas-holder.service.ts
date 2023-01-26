import { ElementRef, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class CanvasHolderService {
    originalCanvas: string = 'Original';
    modifiedCanvas: string = 'Modified';

    private canvasOriginal!: ElementRef<HTMLCanvasElement>;
    private canvasModifier!: ElementRef<HTMLCanvasElement>;

    setCanvas(canvas: ElementRef<HTMLCanvasElement>, canvasName: string): void {
        if (canvasName === this.originalCanvas) {
            this.canvasOriginal = canvas;
        } else if (canvasName === this.modifiedCanvas) {
            this.canvasModifier = canvas;
        }
    }

    getCanvasData(canvasName: string): Uint8ClampedArray | undefined {
        if (canvasName === this.originalCanvas) {
            return this.getData(this.canvasOriginal.nativeElement);
        } else if (canvasName === this.modifiedCanvas) {
            return this.getData(this.canvasModifier.nativeElement);
        } else return undefined;
    }

    getData(canvas: HTMLCanvasElement): Uint8ClampedArray | undefined {
        return canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height).data;
    }

    clearCanvas(): void {
        this.canvasOriginal = {} as ElementRef<HTMLCanvasElement>;
        this.canvasModifier = {} as ElementRef<HTMLCanvasElement>;
    }
}

// this.canvasHolderServiceService.setCanvas(this.canvasOriginal, this.canvasHolderServiceService.originalCanvas);
// this.canvasHolderServiceService.setCanvas(this.canvasModifier, this.canvasHolderServiceService.modifierCanvas);
// this.canvasHolderServiceService.getCanvasData(this.canvasHolderServiceService.originalCanvas);
// this.canvasHolderServiceService.getCanvasData(this.canvasHolderServiceService.modifierCanvas);
