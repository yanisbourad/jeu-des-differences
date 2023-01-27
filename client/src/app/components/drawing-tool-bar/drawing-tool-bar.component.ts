import { Component } from '@angular/core';
import * as constants from '@app/configuration/const-canvas';
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
    constructor(private readonly drawingService: DrawService) {}
    get const(): typeof constants {
        return constants;
    }
    // validateDrawing(): void {}
    // ngOnInit(): void {}
    // ngAfterViewInit(): void {}

    setLineWidth(): void {
        this.drawingService.setLineWidth = this.lineWidth;
    }
    setLineColor(): void {
        this.drawingService.setColor = this.lineColor;
    }
    validateDrawing(): void {
        this.drawingService.validateDrawing(this.selectedRadius);
    }
}
