import { Component } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';
import { DrawService } from '@app/services/draw.service';
import { ImageDiffService } from '@app/services/image-diff.service';
@Component({
    selector: 'app-drawing-tool-bar',
    templateUrl: './drawing-tool-bar.component.html',
    styleUrls: ['./drawing-tool-bar.component.scss'],
})
export class DrawingToolBarComponent {
    lineWidth: number = constants.defaultLineWidth;
    lineColor: string = constants.defaultLineColor;
    selectedRadius: number = constants.possibleRadius[0];
    tic: boolean = false;

    constructor(
        private readonly drawingService: DrawService,
        // private readonly canvasHolder: CanvasHolderService,
        private readonly imageDifferenceService: ImageDiffService,
    ) {}
    get const(): typeof constants {
        return constants;
    }

    setLineWidth(): void {
        this.drawingService.setLineWidth = this.lineWidth;
    }
    setLineColor(): void {
        this.drawingService.setColor = this.lineColor;
    }

    setRadius(): void {
        this.imageDifferenceService.setRadius = this.selectedRadius;
    }

    drawDifferenceImage() {
        // const originalData = this.canvasHolder.getCanvasData(this.canvasHolder.originalCanvas);
        // const modifiedData = this.canvasHolder.getCanvasData(this.canvasHolder.modifiedCanvas);
        this.tic = !this.tic;
        this.imageDifferenceService.resetImageData();
    }
}
