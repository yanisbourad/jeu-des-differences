import { GameRecordCommand } from '@app/classes/game-record';
import { Point } from '@app/interfaces/point';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';

export class ShowDiffRecord extends GameRecordCommand {
    diff: Set<number>;
    position: Point;
    constructor(gameTime: number, diff: Set<number>, position: Point) {
        super(gameTime);
        this.diff = diff;
        this.position = position;
    }

    do(component: GamePageComponent): void {
        component.showDifferenceFoundByMe(this.diff, this.position);
    }
}
