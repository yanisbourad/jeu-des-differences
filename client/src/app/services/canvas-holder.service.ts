import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class CanvasHolderService {
    originalCanvas: string = 'Image Originale';
    modifiedCanvas: string = 'Image Modifiée';

    private canvasOriginal!: Uint8ClampedArray;
    private canvasModifier!: Uint8ClampedArray;

    setCanvas(canvasData: Uint8ClampedArray, canvasName: string): void {
        if (canvasName === this.originalCanvas) {
            this.canvasOriginal = canvasData;
        } else if (canvasName === this.modifiedCanvas) {
            this.canvasModifier = canvasData;
        }
    }

    getCanvasData(canvasName: string): Uint8ClampedArray | undefined {
        if (canvasName === this.originalCanvas) {
            return this.canvasOriginal;
        } else if (canvasName === this.modifiedCanvas) {
            return this.canvasModifier;
        } else return undefined;
    }

    clearCanvas(): void {
        this.canvasOriginal = new Uint8ClampedArray();
        this.canvasModifier = new Uint8ClampedArray();
    }
}
