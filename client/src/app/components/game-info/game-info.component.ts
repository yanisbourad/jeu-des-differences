import { Component, Input } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { HintsDisplayService } from '@app/services/hints/hints-display.service';
import { HintsService } from '@app/services/hints/hints.service';
@Component({
    selector: 'app-game-info',
    templateUrl: './game-info.component.html',
    styleUrls: ['./game-info.component.scss'],
})
export class GameInfoComponent {
    // add input fields of notRewinding from the parent component
    // add input fields of gameType from the parent component
    @Input() notRewinding: boolean;
    gameType: string;
    constructor(public gameService: GameService, public hintsService: HintsService, public hintsDisplayService: HintsDisplayService) {}
}
