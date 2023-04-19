import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DrawDuplicateDrawing } from '@app/classes/commands/draw-duplicate-drawing';
import { DrawExchange } from '@app/classes/commands/draw-exchange-drawing';
import { CanvasNgxComponent } from '@app/components/canvas-ngx/canvas-ngx.component';
import { DifferencePopupComponent } from '@app/components/difference-popup/difference-popup.component';
import { BitmapService } from '@app/services/bitmap/bitmap.service';
import { CanvasHolderService } from '@app/services/canvas-holder/canvas-holder.service';
import { CommandService } from '@app/services/command/command.service';
@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent {
    @ViewChild('originalCanvasComponent') originalCanvasComponent: CanvasNgxComponent;
    @ViewChild('modifiedCanvasComponent') modifiedCanvasComponent: CanvasNgxComponent;
    @ViewChild('fileUpload', { static: false }) fileUpload!: ElementRef<HTMLInputElement>;
    reposition: boolean = false;

    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
        private readonly canvasHolderService: CanvasHolderService,
        private readonly bitmapService: BitmapService,
        private readonly commandService: CommandService,
    ) {}

    get originalCanvas(): string {
        return this.canvasHolderService.originalCanvas;
    }

    get modifiedCanvas(): string {
        return this.canvasHolderService.modifiedCanvas;
    }
    leftSwapDrawing() {
        const command = new DrawDuplicateDrawing(
            this.modifiedCanvasComponent.getCanvasDraw,
            this.originalCanvasComponent.getCanvasDraw,
            this.modifiedCanvas,
        );
        this.commandService.do(command);
    }

    rightSwapDrawing() {
        const command = new DrawDuplicateDrawing(
            this.originalCanvasComponent.getCanvasDraw,
            this.modifiedCanvasComponent.getCanvasDraw,
            this.originalCanvas,
        );
        this.commandService.do(command);
    }

    swapImages(): void {
        const command = new DrawExchange(this.originalCanvasComponent.getCanvasImage, this.modifiedCanvasComponent.getCanvasImage, 'Exchange');
        this.commandService.do(command);
    }

    swapDrawing(): void {
        const command = new DrawExchange(this.originalCanvasComponent.getCanvasDraw, this.modifiedCanvasComponent.getCanvasDraw, 'Exchange');
        this.commandService.do(command);
    }

    openCanvas(): void {
        this.dialog.open(DifferencePopupComponent, {
            disableClose: true,
            minHeight: 'fit-content',
            minWidth: 'fit-content',
        });
    }

    loadImage(e: Event): void {
        this.bitmapService.handleFileSelect(e).then((img) => {
            if (!img) return;
            this.originalCanvasComponent.loadImage(img);
            this.modifiedCanvasComponent.loadImage(img);
        });
        this.fileUpload.nativeElement.value = '';
    }
}
