// this class will represent an action to be performed
// to the game view
// it will be implementing the do action

import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { GameRecorderService } from '@app/services/game-recorder.service';

export abstract class GameRecordCommand {
    time: number;
    // the time the action was performed
    // in milliseconds
    // this will be used to determine the
    // order of the actions
    constructor() {
        // get the time the action was performed in seconds
        this.time = Date.now();
    }

    gameTime(startingTime: number): number {
        return this.time - startingTime || 0;
    }

    record(gameRecordService: GameRecorderService): void {
        gameRecordService.do(this);
    }
    abstract do(component: GamePageComponent): void;
}
