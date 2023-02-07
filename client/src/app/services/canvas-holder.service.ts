import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class CanvasHolderService {
    originalCanvas: string = 'Image Originale';
    modifiedCanvas: string = 'Image Modifiée';

    private canvasOriginal!: Uint8ClampedArray;
    private canvasModifier!: Uint8ClampedArray;
    private canvasOriginalData!: string;
    private canvasModifiedData!: string;

    setCanvas(canvasData: Uint8ClampedArray, canvasName: string): void {
        if (canvasName === this.originalCanvas) {
            this.canvasOriginal = canvasData;
        } else if (canvasName === this.modifiedCanvas) {
            this.canvasModifier = canvasData;
        }
    }
    setCanvasData(canvasData: string, canvasName: string): void {
        if (canvasName === this.originalCanvas) {
            this.canvasOriginalData = canvasData;
        } else if (canvasName === this.modifiedCanvas) {
            this.canvasModifiedData = canvasData;
        }
    }

    getCanvasUrlData(canvasName: string): string {
        if (canvasName === this.originalCanvas) {
            return this.canvasOriginalData;
        } else if (canvasName === this.modifiedCanvas) {
            return this.canvasModifiedData;
        } else return '';
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
        this.canvasOriginalData = '';
        this.canvasModifiedData = '';
    }
}
