import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
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
    showValidation: boolean = false;
    showMessage: string = '';
    showDifference: number = 0;
    lowerLimitDifferenceAllowed;
    upperLimitDifferenceAllowed;

    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<DifferencePopupComponent>,
        private readonly imageDifferenceService: ImageDiffService,
        private readonly drawService: DrawService,
        private changeDetectorRef: ChangeDetectorRef,
    ) {
        this.showValidation = false;
        this.lowerLimitDifferenceAllowed = 2;
        this.upperLimitDifferenceAllowed = 10;
    }

    ngAfterViewInit(): void {
        // this.showDifference = this.imageDifferenceService.listDifferences.length;
        if (this.imageDifferenceService.listDifferences) {
            this.drawService.clearCanvas(this.canvas.nativeElement);
            const differences = this.imageDifferenceService.listDifferences;
            this.drawService.drawAllDiff(differences, this.canvas.nativeElement);
        }

        if (this.showDifference > this.lowerLimitDifferenceAllowed && this.showDifference < this.upperLimitDifferenceAllowed) {
            this.showMessage = '';
            this.showValidation = true;
        } else {
            this.showValidation = false;
            this.showMessage = '(valide entre 3 et 9)';
        }
        this.changeDetectorRef.detectChanges();
    }

    openName() {
        if (this.showValidation) {
            this.dialogRef.close();
            const dialogRefGame = this.dialog.open(GameNameSaveComponent, {
                disableClose: true,
                height: '600x',
                width: '500px',
            });
            dialogRefGame.afterClosed().subscribe();
        }
    }
    closeOnAbort() {
        this.dialogRef.close();
    }
}
