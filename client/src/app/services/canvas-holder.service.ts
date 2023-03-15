import { Injectable } from '@angular/core';
import { CanvasNgxComponent } from '@app/components/canvas-ngx/canvas-ngx.component';

@Injectable({
    providedIn: 'root',
})
export class CanvasHolderService {
    originalCanvas: string = 'Image Original';
    modifiedCanvas: string = 'Image Modifiée';

    private canvasOriginal!: CanvasNgxComponent;
    private canvasModifier!: CanvasNgxComponent;

    setCanvas(canvasNgx: CanvasNgxComponent, canvasName: string): void {
        if (canvasName === this.originalCanvas) {
            this.canvasOriginal = canvasNgx;
        } else if (canvasName === this.modifiedCanvas) {
            this.canvasModifier = canvasNgx;
        } else throw new Error('Canvas name not found');
    }

    getCanvasUrlData(canvasName: string): string {
        if (canvasName === this.originalCanvas) {
            return this.canvasOriginal.getCanvasUrlData();
        } else if (canvasName === this.modifiedCanvas) {
            return this.canvasModifier.getCanvasUrlData();
        } else throw new Error('Canvas name not found');
    }
    getCanvasData(canvasName: string): Uint8ClampedArray {
        if (canvasName === this.originalCanvas) {
            return this.canvasOriginal.getCanvasData();
        } else if (canvasName === this.modifiedCanvas) {
            return this.canvasModifier.getCanvasData();
        } else throw new Error('Canvas name not found');
    }
}
