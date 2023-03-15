import { Component, EventEmitter, Output } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';
import * as stylers from '@app/configuration/const-styler-type';
import { CommandService } from '@app/services/command.service';
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
    tool: string = 'pencil';

    constructor(
        private readonly drawingService: DrawService,
        private readonly imageDifferenceService: ImageDiffService,
        private readonly commandService: CommandService,
    ) {}
    get const(): typeof constants {
        return constants;
    }

    togglePencil() {
        this.drawingService.setTool = stylers.PEN;
        this.tool = 'pencil';
    }
    toggleRectangle() {
        this.drawingService.setTool = stylers.RECTANGLE;
        this.tool = 'rectangle';
    }
    toggleErase(): void {
        this.drawingService.setTool = stylers.ERASER;
        this.tool = 'erase';
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

    undo(): void {
        this.commandService.undo();
    }
    redo(): void {
        this.commandService.redo();
    }
}
