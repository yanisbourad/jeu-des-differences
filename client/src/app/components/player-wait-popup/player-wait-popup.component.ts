import { AfterContentChecked, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GeneralFeedbackComponent } from '@app/components/general-feedback/general-feedback.component';
import { Game } from '@app/interfaces/game-handler';
import { GameCardHandlerService } from '@app/services/game/game-card-handler-service.service';

@Component({
    selector: 'app-player-wait-popup',
    templateUrl: './player-wait-popup.component.html',
    styleUrls: ['./player-wait-popup.component.scss'],
})
export class PlayerWaitPopupComponent implements OnInit, AfterContentChecked {
    game: Game;
    isReady: boolean;
    acceptState = '';
    isUpdated: boolean;
    isLeaving: boolean;
    isReadyToPlay: boolean;
    isRejected: boolean;
    isCancelled: boolean;
    isTriggered: boolean;
    isGameAvailable: boolean;
    limitedTimeGame: string;
    //  we need to disable max-params because we need MatdialogRef, MatDialog for modals
    // eslint-disable-next-line max-params
    constructor(
        public dialogReff: MatDialogRef<PlayerWaitPopupComponent>,
        public dialog: MatDialog,
        public gameCardHandlerService: GameCardHandlerService,
        @Inject(MAT_DIALOG_DATA) public data: { name: string; gameName: string; gameType: string },
    ) {
        this.game = {
            name: '',
            opponentName: '',
            gameName: '',
            gameType: '',
        };
        this.isReady = false;
        this.isUpdated = false;
        this.isLeaving = false;
        this.isReadyToPlay = false;
        this.isRejected = false;
        this.isCancelled = false;
        this.isTriggered = false;
        this.isGameAvailable = true;
        this.limitedTimeGame = '';
    }
    ngOnInit(): void {
        this.game.name = this.data.name;
        this.game.gameName = this.data.gameType === 'double' ? this.data.gameName : 'noGame';
        this.game.opponentName = this.data.gameType === 'double' ? "Attente d'un adversaire" : 'none';
        this.game.gameType = this.data.gameType === 'double' ? 'Double' : 'limit';
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
        } else {
            this.isReady = false;
        }
        this.isUpdated = this.gameCardHandlerService.getNewUpdate();
        if (this.isUpdated) {
            this.gameCardHandlerService.toggleCreateJoin(this.game.gameName);
            this.gameCardHandlerService.setNewUpdate(false);
        }
        this.isReadyToPlay = this.gameCardHandlerService.getReadinessStatus();
        if (this.isReadyToPlay) {
            this.dialogReff.close();
            this.gameCardHandlerService.resetGameVariables();
            this.gameCardHandlerService.setNewUpdate(false);
        }
        this.isRejected = this.gameCardHandlerService.getRejectionStatus();
        if (this.isRejected) {
            this.sendFeedback('Votre adversaire a refusé de jouer avec vous');
            this.dialogReff.close();
            this.gameCardHandlerService.resetGameVariables();
        }
        this.isLeaving = this.gameCardHandlerService.getLeavingState();
        this.isCancelled = this.gameCardHandlerService.getCancelingState();
        if (this.isLeaving) {
            this.dialogReff.close();
            if (!this.isTriggered && this.isCancelled) this.sendFeedback('Le createur de la partie a quitté');
            this.gameCardHandlerService.resetGameVariables();
        }
        this.isGameAvailable = this.gameCardHandlerService.getGameAvailability();
        if (!this.isGameAvailable) {
            this.gameCardHandlerService.redirectToHomePage();
            this.dialogReff.close();
            this.sendFeedback("Désolé, le jeu n'est plus disponible, il a été supprimé");
            this.resetState();
            this.gameCardHandlerService.resetGameVariables();
        }
    }

    leaveGame(): void {
        this.dialogReff.close();
        this.isTriggered = true;
        this.gameCardHandlerService.leave(this.game.gameName);
    }

    startGame(): void {
        this.gameCardHandlerService.startGame(this.game.gameName);
        this.dialogReff.close();
    }

    rejectOpponent(): void {
        this.gameCardHandlerService.rejectOpponent(this.game.gameName);
    }

    sendFeedback(showedMessage: string): void {
        const dialog = this.dialog.open(GeneralFeedbackComponent, {
            data: { message: showedMessage },
            disableClose: true,
        });
        dialog.afterClosed().subscribe((sms) => {
            return sms;
        });
    }

    resetState(): void {
        this.isReady = false;
        this.isUpdated = false;
        this.isLeaving = false;
        this.isReadyToPlay = false;
        this.isRejected = false;
        this.isCancelled = false;
        this.isTriggered = false;
    }
}
