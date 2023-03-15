import { ElementRef } from '@angular/core';
import { CommandSpecific } from '@app/classes/command-specific';
import { Point } from '@app/interfaces/point';
export class DrawListLineCommand extends CommandSpecific {
    points: Point[];
    color: string;
    lineWidth: number;
    oldPointsColor: Map<string, ImageData>;
    // eslint-disable-next-line max-params
    constructor(points: Point[], color: string, width: number, canvas: ElementRef<HTMLCanvasElement>) {
        super(canvas);
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
}
