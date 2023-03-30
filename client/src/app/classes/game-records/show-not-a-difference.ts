import { GameRecordCommand } from '@app/classes/game-record';
import { Point } from '@app/interfaces/point';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';

export class ShowNotADiffRecord extends GameRecordCommand {
    position: Point;
    constructor(position: Point) {
        super();
        this.position = position;
    }

    do(component: GamePageComponent): void {
        component.showErrorNotADifference(this.position);
    }
}
