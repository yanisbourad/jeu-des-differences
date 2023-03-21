import { ElementRef } from '@angular/core';
import { CommandSpecific } from '@app/classes/command-specific';
export class DrawClearCommand extends CommandSpecific {
    oldCanvasData: string;
    backGroundIsClear: boolean;

    constructor(backGroundIsClear: boolean, canvas: ElementRef<HTMLCanvasElement>, canvasName: string) {
        super(canvas, canvasName);
        this.canvas = canvas;
        this.backGroundIsClear = backGroundIsClear;
    }
    do(saveForUndo = true): void {
        const canvas = this.ctx;
        if (saveForUndo) this.oldCanvasData = this.canvasElement.toDataURL();
        if (this.backGroundIsClear) {
            canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
        } else {
            canvas.fillStyle = 'white';
            canvas.fillRect(0, 0, canvas.canvas.width, canvas.canvas.height);
        }
    }
    undo(): void {
        this.putsCanvasData(this.canvas, this.oldCanvasData);
    }
}
