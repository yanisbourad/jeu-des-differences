import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DifferencePopupComponent } from '@app/components/difference-popup/difference-popup.component';
import { CanvasHolderService } from '@app/services/canvas-holder.service';
@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnInit {
    constructor(public dialog: MatDialog, private readonly canvasHolderService: CanvasHolderService) {}

    get originalCanvas(): string {
        return this.canvasHolderService.originalCanvas;
    }
    get modifiedCanvas(): string {
        return this.canvasHolderService.modifiedCanvas;
    }
    ngOnInit(): void {
        this.canvasHolderService.clearCanvas();
    }
    goBack(): void {
        this.canvasHolderService.clearCanvas();
    }
    openCanvas(): void {
        const dialogRef = this.dialog.open(DifferencePopupComponent, {
            height: '480x',
            width: '640px',
        });
        dialogRef.afterClosed().subscribe();
    }
}
