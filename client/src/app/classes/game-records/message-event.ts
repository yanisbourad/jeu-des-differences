import { GameRecordCommand } from '@app/classes/game-record';
import { Message } from '@app/interfaces/message';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';

export class GameMessageEvent extends GameRecordCommand {
    message: Message;

    constructor(gameTime: number, message: Message) {
        super(gameTime);
        this.message = message;
    }
    do(component: GamePageComponent): void {
        component.showMessage(this.message);
    }
}
