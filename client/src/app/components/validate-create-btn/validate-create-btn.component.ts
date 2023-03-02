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
    originalData: Uint8ClampedArray;
    modifiedData: Uint8ClampedArray;

    constructor(private readonly canvasHolder: CanvasHolderService, private readonly imageDifferenceService: ImageDiffService) {
        this.originalData = new Uint8ClampedArray();
        this.modifiedData = new Uint8ClampedArray();
    }

    onClick() {
        this.originalData = this.canvasHolder.getCanvasData(this.canvasHolder.originalCanvas);
        this.modifiedData = this.canvasHolder.getCanvasData(this.canvasHolder.modifiedCanvas);
        if (this.originalData && this.modifiedData) {
            this.imageDifferenceService.resetImageData();
            this.imageDifferenceService.setPixelMatrix(this.originalData, this.modifiedData);
            this.imageDifferenceService.getDifferenceMatrix();
            this.imageDifferenceService.defineDifferences();
        }
        this.onBtnClick.emit();
    }
}
