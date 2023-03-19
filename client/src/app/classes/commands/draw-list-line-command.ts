import { ElementRef } from '@angular/core';
import { CommandSpecific } from '@app/classes/command-specific';
import { DEFAULT_LINE_CAP } from '@app/configuration/const-canvas';
import { Point } from '@app/interfaces/point';

export class DrawListLineCommand extends CommandSpecific {
    points: Point[];
    color: string;
    lineWidth: number;
    oldPointsColor: Map<string, ImageData>;
    // eslint-disable-next-line max-params
    constructor(points: Point[], color: string, width: number, canvas: ElementRef<HTMLCanvasElement>, canvasName: string) {
        super(canvas, canvasName);
        this.points = points;
        this.color = color;
        this.lineWidth = width;
        this.oldPointsColor = new Map<string, ImageData>();
    }

    do(saveForUndo: boolean): void {
        if (saveForUndo) this.oldPointsColor = this.saveLineOldColors(this.points, this.lineWidth);
        this.drawListLine(this.points, this.color, this.lineWidth);
    }

    undo(): void {
        this.restoreLastCanvasState(this.oldPointsColor);
    }

    protected drawListLine(drawing: Point[], color: string, lineWidth: number): void {
        if (drawing.length <= 1) return;
        const context = this.ctx;
        context.lineCap = DEFAULT_LINE_CAP;
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        for (let i = 1; i < drawing.length; i++) {
            const lastPoint = drawing[i - 1];
            const point = drawing[i];
            context.beginPath();
            context.moveTo(lastPoint.x, lastPoint.y);
            context.lineTo(point.x, point.y);
            context.stroke();
        }
    }
}
