import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CanvasHolderService } from '@app/services/canvas-holder.service';
import { ImageDiffService } from '@app/services/image-diff.service';

@Component({
    selector: 'app-validate-create-btn',
    templateUrl: './validate-create-btn.component.html',
    styleUrls: ['./validate-create-btn.component.scss'],
})
export class ValidateCreateBtnComponent {
    @Input() text!: string;
    @Input() color!: string;
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output() onBtnClick = new EventEmitter();

    constructor(private readonly canvasHolder: CanvasHolderService, private readonly imageDifferenceService: ImageDiffService) {}

    onClick() {
        const originalData = this.canvasHolder.getCanvasData(this.canvasHolder.originalCanvas);
        const modifiedData = this.canvasHolder.getCanvasData(this.canvasHolder.modifiedCanvas);
        if (originalData && modifiedData) {
            this.imageDifferenceService.setPixelMatrix(originalData, modifiedData);
            this.imageDifferenceService.getDifferenceMatrix();
            this.imageDifferenceService.setDifferenceDataToDraw();
            this.imageDifferenceService.defineDifferences();
        } else {
            alert('Error: No image loaded!');
        }
        this.onBtnClick.emit();
    }
}
