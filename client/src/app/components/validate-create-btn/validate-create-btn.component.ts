import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CanvasHolderService } from '@app/services/canvas-holder.service';
import { GameDatabaseService } from '@app/services/game-database.sercice';
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

    constructor(
        private readonly canvasHolder: CanvasHolderService,
        private readonly imageDifferenceService: ImageDiffService,
        private readonly gameDataBase: GameDatabaseService,
    ) {}

    onClick() {
        const originalData = this.canvasHolder.getCanvasData(this.canvasHolder.originalCanvas);
        const modifiedData = this.canvasHolder.getCanvasData(this.canvasHolder.modifiedCanvas);
        if (originalData && modifiedData) {
            this.imageDifferenceService.resetImageData();
            this.imageDifferenceService.setPixelMatrix(originalData, modifiedData);
            this.imageDifferenceService.setDifferenceDataToDraw();
            this.imageDifferenceService.defineDifferences();
            const text = 'Enter the name of the game:';
            const defaultText = 'Game name';
            const resp = window.prompt(text, defaultText);
            this.gameDataBase.saveGame(resp?.toString() || 'hiihi');
        } else {
            alert('Error: No image loaded!');
        }
        this.onBtnClick.emit();
    }
}
