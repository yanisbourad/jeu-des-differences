import { Component, EventEmitter, Input, Output } from '@angular/core';
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

    constructor(private readonly imageDifferenceService: ImageDiffService) {}

    onClick() {
        this.imageDifferenceService.resetImageData();
        this.imageDifferenceService.setPixelMatrix();
        this.imageDifferenceService.getDifferenceMatrix();
        this.imageDifferenceService.defineDifferences();
        this.onBtnClick.emit();
    }
}
