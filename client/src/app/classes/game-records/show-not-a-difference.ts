import { GameRecordCommand } from '@app/classes/game-record';
import { Point } from '@app/interfaces/point';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';

export class ShowNotADiffRecord extends GameRecordCommand {
    position: Point;
    constructor(gameTime: number, position: Point) {
        super(gameTime);
        this.position = position;
    }

    do(component: GamePageComponent): void {
        component.showErrorNotADifference(this.position);
    }
}
