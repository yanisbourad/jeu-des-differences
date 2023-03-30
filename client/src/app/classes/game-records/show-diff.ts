import { GameRecordCommand } from '@app/classes/game-record';
import { Point } from '@app/interfaces/point';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';

export class ShowDiffRecord extends GameRecordCommand {
    diff: Set<number>;
    position: Point;
    isMeHowFound: boolean;
    // eslint-disable-next-line max-params
    constructor(gameTime: number, diff: Set<number>, position: Point = { x: 0, y: 0 }, isMeHowFound: boolean = false) {
        super(gameTime);
        this.diff = diff;
        this.position = position;
        this.isMeHowFound = isMeHowFound;
    }

    do(component: GamePageComponent): void {
        if (this.isMeHowFound) {
            component.showDifferenceFoundByMe(this.diff, this.position);
        } else {
            component.drawDifference(this.diff);
            component.gameService.handlePlayerDifference();
        }
    }
}
