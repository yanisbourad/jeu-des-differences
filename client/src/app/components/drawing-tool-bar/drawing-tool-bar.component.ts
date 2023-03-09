import { Component, EventEmitter, Output } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';
import { DrawService } from '@app/services/draw.service';
import { ImageDiffService } from '@app/services/image-diff.service';
@Component({
    selector: 'app-drawing-tool-bar',
    templateUrl: './drawing-tool-bar.component.html',
    styleUrls: ['./drawing-tool-bar.component.scss'],
})
export class DrawingToolBarComponent {
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output() onReadyToDraw = new EventEmitter();
    lineWidth: number = constants.DEFAULT_LINE_WIDTH;
    lineColor: string = constants.DEFAULT_LINE_COLOR;
    selectedRadius: number = constants.POSSIBLE_RADIUS[0];
    showMessage: boolean = false;
    showDifference: number = 0;
    tic: boolean = false;

    constructor(private readonly drawingService: DrawService, private readonly imageDifferenceService: ImageDiffService) {}
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
}