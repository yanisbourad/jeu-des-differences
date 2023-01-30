import { Component } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';
import { CanvasHolderService } from '@app/services/canvas-holder.service';
import { DrawService } from '@app/services/draw.service';
@Component({
    selector: 'app-drawing-tool-bar',
    templateUrl: './drawing-tool-bar.component.html',
    styleUrls: ['./drawing-tool-bar.component.scss'],
})
export class DrawingToolBarComponent {
    lineWidth: number = constants.defaultLineWidth;
    lineColor: string = constants.defaultLineColor;
    selectedRadius: number = constants.possibleRadius[0];
    constructor(private readonly drawingService: DrawService, private readonly canvasHolder: CanvasHolderService) {}
    get const(): typeof constants {
        return constants;
    }

    setLineWidth(): void {
        this.drawingService.setLineWidth = this.lineWidth;
    }
    setLineColor(): void {
        this.drawingService.setColor = this.lineColor;
    }
    validateDifferences(): void {
        this.canvasHolder.getCanvasData(this.canvasHolder.originalCanvas);
        this.canvasHolder.getCanvasData(this.canvasHolder.modifiedCanvas);
    }
}
