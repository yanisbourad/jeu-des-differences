import { Component, EventEmitter, Output } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';
import * as stylers from '@app/configuration/const-styler-type';
import { CommandService } from '@app/services/command/command.service';
import { DrawService } from '@app/services/draw/draw.service';
import { ImageDiffService } from '@app/services/image-diff/image-diff.service';
@Component({
    selector: 'app-drawing-tool-bar',
    templateUrl: './drawing-tool-bar.component.html',
    styleUrls: ['./drawing-tool-bar.component.scss'],
})
export class DrawingToolBarComponent {
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output() onReadyToDraw = new EventEmitter();
    lineWidth: number;
    lineColor: string;
    selectedRadius: number;
    showMessage: boolean;
    showDifference: number;
    tool: string;

    constructor(
        private readonly drawingService: DrawService,
        private readonly imageDifferenceService: ImageDiffService,
        private readonly commandService: CommandService,
    ) {
        this.lineWidth = constants.DEFAULT_LINE_WIDTH;
        this.lineColor = constants.DEFAULT_LINE_COLOR;
        this.selectedRadius = constants.DEFAULT_RADIUS;
        this.showMessage = false;
        this.showDifference = 0;
        this.tool = 'pencil';
    }
    get const(): typeof constants {
        return constants;
    }

    togglePencil(): void {
        this.drawingService.setTool = stylers.PEN;
        this.tool = 'pencil';
    }

    toggleRectangle(): void {
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
