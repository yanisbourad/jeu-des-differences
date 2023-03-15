import { ElementRef } from '@angular/core';
import { CommandSpecific } from '@app/classes/command-specific';
export class DrawExchange extends CommandSpecific {
    canvas1Data: string;
    canvas2Data: string;
    canvas2: ElementRef<HTMLCanvasElement>;
    saved: boolean = false;
    constructor(canvas1: ElementRef<HTMLCanvasElement>, canvas2: ElementRef<HTMLCanvasElement>, canvasName: string) {
        super(canvas1, canvasName);
        this.canvas2 = canvas2;
        this.canvas2Data = this.getScreenShot(this.canvas2);
        this.canvas1Data = this.getScreenShot(this.canvas);
    }

    do(saveForUndo = true): void {
        if (saveForUndo) {
            this.saved = true;
        }
        this.clearCanvas(this.canvas);
        this.clearCanvas(this.canvas2);
        this.putsCanvasData(this.canvas, this.canvas2Data);
        this.putsCanvasData(this.canvas2, this.canvas1Data);
    }
    undo(): void {
        if (this.saved) {
            this.clearCanvas(this.canvas);
            this.clearCanvas(this.canvas2);
            this.putsCanvasData(this.canvas, this.canvas1Data);
            this.putsCanvasData(this.canvas2, this.canvas2Data);
        }
    }
}
