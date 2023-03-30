import { GameRecordCommand } from '@app/classes/game-record';
import { Message } from '@app/interfaces/message';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';

export class GameMessageEvent extends GameRecordCommand {
    message: Message;

    constructor(message: Message) {
        super();
        this.message = message;
    }
    do(component: GamePageComponent): void {
        component.showMessage(this.message);
    }
}
