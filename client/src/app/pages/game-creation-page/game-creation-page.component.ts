import { Component, OnInit } from '@angular/core';
import { CanvasHolderService } from '@app/services/canvas-holder.service';
@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnInit {
    constructor(private readonly canvasHolderService: CanvasHolderService) {}

    get originalCanvas(): string {
        return this.canvasHolderService.originalCanvas;
    }
    get modifiedCanvas(): string {
        return this.canvasHolderService.modifiedCanvas;
    }
    ngOnInit(): void {
        this.canvasHolderService.clearCanvas();
    }
}
