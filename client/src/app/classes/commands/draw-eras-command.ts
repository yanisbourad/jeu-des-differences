import { ElementRef } from '@angular/core';
import { CommandSpecific } from '@app/classes/command-specific';
import { Point } from '@app/interfaces/point';

export class DrawErasLineCommand extends CommandSpecific {
    oldPointsColor: Map<string, ImageData>;
    points: Point[];
    lineWidth: number;
    constructor(points: Point[], lineWidth: number, canvas: ElementRef<HTMLCanvasElement>) {
        super(canvas);
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
        ctx.beginPath();
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = 'white';
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
    }
}
