// this class will represent an action to be performed
// to the game view
// it will be implementing the do action

import { GamePageComponent } from '@app/pages/game-page/game-page.component';

export abstract class GameRecordCommand {
    time: number;
    // the time the action was performed
    // in milliseconds
    // this will be used to determine the
    // order of the actions
    constructor(gameTime: number) {
        this.time = gameTime;
    }

    get gameTime(): number {
        return this.gameTime;
    }

    abstract do(component: GamePageComponent): void;
}
