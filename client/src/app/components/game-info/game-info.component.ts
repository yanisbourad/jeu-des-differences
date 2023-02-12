import { Component, OnInit } from '@angular/core';
import * as constants from '@app/configuration/const-game';
import { GameService } from '@app/services/game.service';
@Component({
    selector: 'app-game-info',
    templateUrl: './game-info.component.html',
    styleUrls: ['./game-info.component.scss'],
})
export class GameInfoComponent implements OnInit {
    constructor(public gameService: GameService) {}

    ngOnInit(): void {
        setTimeout(() => {
            this.gameService.displayIcons();
        }, constants.waitingTime);
    }
}
