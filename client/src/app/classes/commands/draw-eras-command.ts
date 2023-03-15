import { ElementRef } from '@angular/core';
import { CommandSpecific } from '@app/classes/command-specific';
import { Point } from '@app/interfaces/point';

export class DrawErasLineCommand extends CommandSpecific {
    oldPointsColor: Map<string, ImageData>;
    points: Point[];
    lineWidth: number;
    // eslint-disable-next-line max-params
    constructor(points: Point[], lineWidth: number, canvas: ElementRef<HTMLCanvasElement>, canvasName: string) {
        super(canvas, canvasName);
        this.points = points;
        this.lineWidth = lineWidth;
    }
    do(saveForUndo = true): void {
        if (saveForUndo) this.oldPointsColor = this.saveLineOldColors(this.points, this.lineWidth);
        this.ctx.globalCompositeOperation = 'destination-out';
        this.drawErasLine(this.points, this.lineWidth);
        this.ctx.globalCompositeOperation = 'source-over';
    }
    undo(): void {
        this.restoreLastCanvasState(this.oldPointsColor);
    }

    drawErasLine(points: Point[], lineWidth: number): void {
        const ctx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const diff = lineWidth / 2;
        for (let i = 1; i < points.length; i++) {
            ctx.clearRect(points[i].x - diff, points[i].y - diff, lineWidth, lineWidth);
        }
    }
}
