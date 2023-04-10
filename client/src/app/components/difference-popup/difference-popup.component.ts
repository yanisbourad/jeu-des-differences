import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GameNameSaveComponent } from '@app/components/game-name-save/game-name-save.component';
import { DrawService } from '@app/services/draw/draw.service';
import { ImageDiffService } from '@app/services/image-diff/image-diff.service';

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
        private changeDetectorRef: ChangeDetectorRef,
    ) {
        this.showValidation = false;
        this.lowerLimitDifferenceAllowed = 2;
        this.upperLimitDifferenceAllowed = 10;
    }

    ngAfterViewInit(): void {
        this.showDifference = this.imageDifferenceService.listDifferences.length;
        if (this.showDifference !== 0) {
            DrawService.clearCanvas(this.canvas.nativeElement);
            const differences = this.imageDifferenceService.listDifferences;
            DrawService.drawAllDiff(differences, this.canvas.nativeElement);
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
        this.showDifference = this.imageDifferenceService.listDifferences.length;
        if (this.showValidation) {
            const dialogRefGame = this.dialog.open(GameNameSaveComponent, {
                disableClose: true,
                height: '250px',
                width: '500px',
            });
            this.dialogRef.close();
            dialogRefGame.afterClosed();
        }
    }
    closeOnAbort() {
        this.dialogRef.close();
    }
}
