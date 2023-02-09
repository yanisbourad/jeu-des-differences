import { AfterViewInit, Component, OnInit } from '@angular/core';
import { GameService } from '@app/services/game.service';
@Component({
    selector: 'app-game-info',
    templateUrl: './game-info.component.html',
    styleUrls: ['./game-info.component.scss'],
})
export class GameInfoComponent implements OnInit, AfterViewInit{
    constructor(public gameService: GameService) {}
    ngAfterViewInit(): void {
        setTimeout( ()=>{
            this.gameService.displayIcons();
        }, 250);
        }
    ngOnInit(): void {
    }

    getHint() {
        this.gameService.clickGetHints();
    }
}
