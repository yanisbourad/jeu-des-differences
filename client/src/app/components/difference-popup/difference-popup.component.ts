import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DrawService } from '@app/services/draw.service';
import { ImageDiffService } from '@app/services/image-diff.service';
// eslint-disable-next-line no-restricted-imports
import { GameNameSaveComponent } from '../game-name-save/game-name-save.component';

@Component({
    selector: 'app-difference-popup',
    templateUrl: './difference-popup.component.html',
    styleUrls: ['./difference-popup.component.scss'],
})
export class DifferencePopupComponent implements AfterViewInit {
    @ViewChild('dd', { static: false }) private canvas!: ElementRef<HTMLCanvasElement>;
    showPixel: boolean = true;
    ctx: CanvasRenderingContext2D;
    showDifferentPixels: boolean;
    showValidation: boolean;
    showMessage: boolean = false;
    showDifference: number = 0;

    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DifferencePopupComponent>,
        private readonly imageDifferenceService: ImageDiffService,
        private readonly drawService: DrawService,
    ) {}

    ngAfterViewInit(): void {
        this.showDifferentPixels = true;
        if (this.imageDifferenceService.getDifferenceNumber() !== 0) {
            console.log(this.imageDifferenceService.getDifferenceNumber());
            this.showDifference = this.imageDifferenceService.getDifferenceNumber();
            this.showDifferentPixels = true;
            this.drawService.clearCanvas(this.canvas.nativeElement);
            const differences = this.imageDifferenceService.getDifferencePixelToDraw();
            this.drawService.drawAllDiff(differences, this.canvas.nativeElement);
            this.showValidation = true;
        }
    }

    openName() {
        this.dialogRef.close();
        const dialogRefGame = this.dialog.open(GameNameSaveComponent, {
            disableClose: true,
            height: '600x',
            width: '500px',
        });
        dialogRefGame.afterClosed().subscribe();
    }
    closeOnAbort() {
        this.dialogRef.close();
    }
}
