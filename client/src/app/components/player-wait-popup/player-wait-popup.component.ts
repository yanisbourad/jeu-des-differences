import { AfterContentChecked, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Game } from '@app/interfaces/game-handler';
import { GameCardHandlerService } from '@app/services/game-card-handler-service.service';

@Component({
    selector: 'app-player-wait-popup',
    templateUrl: './player-wait-popup.component.html',
    styleUrls: ['./player-wait-popup.component.scss'],
})
export class PlayerWaitPopupComponent implements OnInit, AfterContentChecked {
    game: Game;
    isReady: boolean;
    acceptState = '';
    // eslint-disable-next-line max-params
    constructor(
        public dialogReff: MatDialogRef<PlayerWaitPopupComponent>,
        public gameCardHandlerService: GameCardHandlerService,
        @Inject(MAT_DIALOG_DATA) public data: { name: string; gameName: string; gameType: string }, // private route: Router,
    ) {
        this.game = {
            name: '',
            opponentName: '',
            gameName: '',
        };
        this.isReady = false;
    }
    ngOnInit(): void {
        this.game.name = this.data.name;
        this.game.gameName = this.data.gameName;
        this.game.opponentName = "Attente d'un adversaire";
        this.data.name = ' ';
        this.gameCardHandlerService.join(this.game);
        this.gameCardHandlerService.toggleCreateJoin(this.game.gameName);
    }

    ngAfterContentChecked(): void {
        this.gameCardHandlerService.toggleCreateJoin(this.game.gameName);
        this.game.opponentName = this.gameCardHandlerService.opponentPlayer;
        if (this.gameCardHandlerService.getCreatorStatus() && this.game.opponentName !== "Attente d'un adversaire") {
            this.isReady = true;
            this.acceptState = this.gameCardHandlerService.getGameState();
        }
        if (this.gameCardHandlerService.getReadinessStatus()) {
            this.dialogReff.close();
        }
    }

    leaveGame(): void {
        this.gameCardHandlerService.leave(this.game.gameName);
        this.dialogReff.close();
    }

    startGame(): void {
        this.gameCardHandlerService.startGame(this.game.gameName);
        this.dialogReff.close();
    }

    rejectOpponent(): void {
        this.gameCardHandlerService.rejectOpponent(this.game.gameName);
    }
}
