import { ElementRef } from '@angular/core';
import { CommandSpecific } from '@app/classes/command-specific';
export class DrawDuplicateDrawing extends CommandSpecific {
    oldCanvasData: string;
    canvasOld;
    previousCanvasData: string | undefined;

    constructor(canvasOld: ElementRef<HTMLCanvasElement>, canvasNew: ElementRef<HTMLCanvasElement>, canvasName: string) {
        super(canvasNew, canvasName);
        this.canvasOld = canvasOld;
    }

    do(saveForUndo: boolean): void {
        this.oldCanvasData = this.getScreenShot(this.canvasOld);
        if (saveForUndo) {
            this.previousCanvasData = this.getScreenShot(this.canvas);
        }
        this.clearCanvas(this.canvas);
        this.putsCanvasData(this.canvas, this.oldCanvasData);
    }
    undo(): void {
        if (this.previousCanvasData) {
            this.putsCanvasData(this.canvas, this.previousCanvasData);
        }
    }
}
