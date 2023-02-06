import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CanvasHolderService } from '@app/services/canvas-holder.service';
import { DrawService } from '@app/services/draw.service';
import { ImageDiffService } from '@app/services/image-diff.service';
@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnInit {
    @ViewChild('dd', { static: false }) private canvas!: ElementRef<HTMLCanvasElement>;
    showPixel: boolean = true;
    ctx: CanvasRenderingContext2D;
    showDifferentPixels: boolean = true;
    constructor(
        private readonly canvasHolderService: CanvasHolderService,
        private readonly imageDifferenceService: ImageDiffService,
        private readonly drawService: DrawService,
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
    goBack(): void {
        this.canvasHolderService.clearCanvas();
    }

    drawDifferencePixel() {
        this.drawService.clearCanvas(this.canvas.nativeElement);
        const differences = this.imageDifferenceService.getDifferencePixelToDraw();
        this.drawService.drawAllDiff(differences, this.canvas.nativeElement);
    }
}
