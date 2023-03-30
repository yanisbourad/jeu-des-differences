import { GameRecordCommand } from '@app/classes/game-record';
import { Point } from '@app/interfaces/point';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';

export class ShowDiffRecord extends GameRecordCommand {
    diff: Set<number>;
    position: Point;
    isMeWhoFound: boolean;
    // eslint-disable-next-line max-params
    constructor(diff: Set<number>, position: Point = { x: 0, y: 0 }, isMeWhoFound: boolean = false) {
        super();
        this.diff = diff;
        this.position = position;
        this.isMeWhoFound = isMeWhoFound;
    }

    do(component: GamePageComponent): void {
        if (this.isMeWhoFound) {
            component.showDifferenceFoundByMe(this.diff, this.position);
        } else {
            component.drawDifference(this.diff);
            component.gameService.handlePlayerDifference();
        }
    }
}
