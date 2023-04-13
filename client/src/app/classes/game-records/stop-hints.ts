import { GameRecordCommand } from '@app/classes/game-record';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';

export class StopHintsRecord extends GameRecordCommand {
    do(component: GamePageComponent): void {
        component.hintsService.stopHints();
    }
}