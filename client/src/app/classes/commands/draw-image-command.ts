import { ElementRef } from '@angular/core';
import { CommandSpecific } from '@app/classes/command-specific';
export class DrawImageCommand extends CommandSpecific {
    image: ImageBitmap;
    oldCanvasData: string;

    constructor(image: ImageBitmap, canvas: ElementRef<HTMLCanvasElement>) {
        super(canvas);
        this.canvas = canvas;
        this.image = image;
    }
    do(saveForUndo = true): void {
        const canvas = this.ctx;
        if (saveForUndo) this.oldCanvasData = this.canvasElement.toDataURL();
        canvas.drawImage(this.image, 0, 0);
    }
    undo(): void {
        const canvas = this.ctx;
        const img = new Image();
        img.src = this.oldCanvasData;
        img.onload = () => canvas.drawImage(img, 0, 0);
    }
}
