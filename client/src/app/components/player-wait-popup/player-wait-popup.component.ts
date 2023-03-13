import { AfterContentChecked, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Game } from '@app/interfaces/game-handler';
import { GameCardHandlerService } from '@app/services/game-card-handler-service.service';

@Component({
    selector: 'app-player-wait-popup',
    templateUrl: './player-wait-popup.component.html',
    styleUrls: ['./player-wait-popup.component.scss'],
})
export class PlayerWaitPopupComponent implements OnInit, AfterContentChecked {
    game: Game;
    // eslint-disable-next-line max-params
    constructor(
        public dialogReff: MatDialogRef<PlayerWaitPopupComponent>,
        public gameCardHandlerService: GameCardHandlerService,
        @Inject(MAT_DIALOG_DATA) public data: { name: string; gameName: string; gameType: string },
        private route: Router,
    ) {
        this.game = {
            name: '',
            opponentName: '',
            gameName: '',
        };
    }
    ngOnInit(): void {
        this.game.name = this.data.name;
        this.game.gameName = this.data.gameName;
        this.game.opponentName = ' ';
        this.data.name = ' ';
        this.gameCardHandlerService.join(this.game);
    }

    ngAfterContentChecked(): void {
        this.gameCardHandlerService.toggleCreateJoin(this.game.gameName);
    }

    leaveGame(): void {
        this.gameCardHandlerService.leave(this.game.gameName);
        this.dialogReff.close();
    }

    startGame(): void {
        this.gameCardHandlerService.startGame(this.game.gameName);
        this.redirect();
        this.dialogReff.close();
    }

    redirect(): void {
        this.route.navigate([
            '/game',
            {
                player: this.game.name,
                opponentName: this.game.opponentName,
                gameName: this.data.gameName,
            },
        ]);
    }
}
