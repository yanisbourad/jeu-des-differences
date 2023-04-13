import { ElementRef } from '@angular/core';
import { GameRecordCommand } from '@app/classes/game-record';
import { Vec2 } from '@app/interfaces/vec2';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { DrawService } from '@app/services/draw/draw.service';
interface Canvases {
    canvas1: ElementRef<HTMLCanvasElement>;
    canvas2: ElementRef<HTMLCanvasElement>;
}

interface AllCanvas {
    canvas1: ElementRef<HTMLCanvasElement>;
    canvas2: ElementRef<HTMLCanvasElement>;
    canvas0: ElementRef<HTMLCanvasElement>;
    canvas3: ElementRef<HTMLCanvasElement>;
}
export class ShowDiffRecord extends GameRecordCommand {
    diff: Set<number>;
    canvas: Canvases | AllCanvas;
    isMeWhoFound: boolean;
    position: Vec2;
    // eslint-disable-next-line max-params
    constructor(diff: Set<number>, canvas: Canvases | AllCanvas, isMeWhoFound: boolean = false, position: Vec2 = { x: 0, y: 0 }) {
        super();
        this.diff = diff;
        this.canvas = canvas;
        this.isMeWhoFound = isMeWhoFound;
        this.position = position;
    }

    do(component: GamePageComponent): void {
        if (this.isMeWhoFound) {
            component.gameService.reduceNbrDifferences();
            this.displayWord('Trouvé', this.canvas as AllCanvas, this.position);
        } else {
            component.gameService.handlePlayerDifference();
        }
        const originalImage: string = component.gameService.game.originalImageData;
        DrawService.getImageDateFromDataUrl(originalImage).subscribe((imageData) => {
            this.drawDifference(this.diff, this.canvas, imageData, component.getCanvasImageModifier);
        });
        if (component.gameService.mode) {
            this.clearCanvas(this.canvas.canvas1.nativeElement, this.canvas.canvas2.nativeElement);
            component.gameService.defineVariables();
            component.gameService.displayIcons();
            component.gameService.iconsUpdateForTimeLimit();
        }
        component.cheatModeService.removeDifference(this.diff);
        component.hintsService.removeDifference(this.diff);
    }

    drawDifference(
        diff: Set<number>,
        canvas: {
            canvas1: ElementRef<HTMLCanvasElement>;
            canvas2: ElementRef<HTMLCanvasElement>;
        },
        originalImage: ImageData,
        canvasImageModifier: HTMLCanvasElement,
    ): void {
        DrawService.drawDiff(diff, canvas.canvas1.nativeElement);
        DrawService.drawDiff(diff, canvas.canvas2.nativeElement);
        DrawService.drawDiff(diff, canvasImageModifier, 'black', originalImage);
        this.clearCanvas(canvas.canvas1.nativeElement, canvas.canvas2.nativeElement);
    }
}
