import { GameRecordCommand } from '@app/classes/game-record';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';

export class StartCheatModeRecord extends GameRecordCommand {
    do(component: GamePageComponent): void {
        component.cheatMode();
    }
}
