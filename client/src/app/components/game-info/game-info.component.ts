import { Component, OnInit } from '@angular/core';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-game-info',
    templateUrl: './game-info.component.html',
    styleUrls: ['./game-info.component.scss'],
})
export class GameInfoComponent implements OnInit {
    constructor(public gameService: GameService) {}
    // in infos component change display depending of the game mode (solo, multijoueur, temps limite)
    ngOnInit(): void {
        this.gameService.displayIcons();
    }

    getHint() {
        this.gameService.clickGetHints();
    }
}
