import { ElementRef } from '@angular/core';
import { CommandSpecific } from '@app/classes/command-specific';
export class DrawDuplicateDrawing extends CommandSpecific {
    oldCanvasData: string;
    previousCanvasData: string | undefined;

    constructor(canvasOld: ElementRef<HTMLCanvasElement>, canvasNew: ElementRef<HTMLCanvasElement>, canvasName: string) {
        super(canvasNew, canvasName);
        this.oldCanvasData = this.getScreenShot(canvasOld);
    }

    do(saveForUndo: boolean): void {
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
