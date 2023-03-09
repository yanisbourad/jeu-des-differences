import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanvasNgxComponent } from '@app/components/canvas-ngx/canvas-ngx.component';
import { DifferencePopupComponent } from '@app/components/difference-popup/difference-popup.component';
import { BitmapService } from '@app/services/bitmap.service';
import { CanvasHolderService } from '@app/services/canvas-holder.service';
@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnInit {
    @ViewChild('originalCanvasComponent') originalCanvasComponent: CanvasNgxComponent;
    @ViewChild('modifiedCanvasComponent') modifiedCanvasComponent: CanvasNgxComponent;
    @ViewChild('fileUpload', { static: false }) fileUpload!: ElementRef<HTMLInputElement>;
    reposition: boolean = false;

    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
        private renderer: Renderer2,
        private element: ElementRef,
        private readonly canvasHolderService: CanvasHolderService,
        private readonly bitmapService: BitmapService,
    ) {}

    get originalCanvas(): string {
        return this.canvasHolderService.originalCanvas;
    }

    get modifiedCanvas(): string {
        return this.canvasHolderService.modifiedCanvas;
    }

    ngOnInit(): void {
        this.canvasHolderService.clearCanvas();
    }

    handleSwapping(element1Id: string, element2Id: string): void {
        const element1Image = this.element.nativeElement.querySelector(element1Id);
        const middleButtons = this.element.nativeElement.querySelector('.swapping-canvas');
        const element2Image = this.element.nativeElement.querySelector(element2Id);

        this.renderer.insertBefore(element1Image.parentNode, element2Image, element1Image);
        this.renderer.insertBefore(element1Image.parentNode, middleButtons, element1Image);
    }

    swapImages(): void {
        if (this.reposition) {
            this.handleSwapping('.original', '.modified');
        } else {
            this.handleSwapping('.modified', '.original');
        }
        this.reposition = !this.reposition;
    }

    openCanvas(): void {
        this.dialog.open(DifferencePopupComponent, {
            disableClose: true,
            height: '480x',
            width: '640px',
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