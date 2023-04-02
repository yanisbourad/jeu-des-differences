import { GameRecordCommand } from '@app/classes/game-record';
import { AllCanvas } from '@app/interfaces/canvas-holder';
import { Vec2 } from '@app/interfaces/vec2';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';

export class ShowNotADiffRecord extends GameRecordCommand {
    allCanvas: AllCanvas;
    position: Vec2;
    constructor(allCanvas: AllCanvas, position: Vec2 = { x: 0, y: 0 }) {
        super();
        this.allCanvas = allCanvas;
        this.position = position;
    }

    do(component: GamePageComponent): void {
        component.gameService.startPenaltyTimer();
        this.displayWord('Erreur', this.allCanvas, this.position);
        this.clearCanvas(this.allCanvas.canvas0.nativeElement, this.allCanvas.canvas3.nativeElement);
    }
}
