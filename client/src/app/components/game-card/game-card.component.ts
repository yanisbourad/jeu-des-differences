import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NamePopupComponent } from '@app/components/name-popup/name-popup.component';
import { VerificationFeedbackComponent } from '@app/components/verification-feedback/verification-feedback.component';
import { GameCardHandlerService } from '@app/services/game/game-card-handler-service.service';
import { GameService } from '@app/services/game/game.service';
import { GameInfo } from '@common/game';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit {
    @Input() card!: GameInfo;
    @Output() gameDeleted = new EventEmitter<void>();
    createJoinState: string;
    name: string;
    gameName: string;
    typePage: 'Classique' | 'Configuration';
    url: string;
    messageDeleteRecords: string;
    messageDeleteGame: string;

    //  we need to disable max-params because we need to use both two services and at
    // the same time MatDialog and Router to navigate to the right page
    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
        private router: Router,
        readonly gameService: GameService,
        private readonly gameCardHandlerService: GameCardHandlerService,
    ) {
        this.createJoinState = 'Créer';
        this.messageDeleteRecords = 'Êtes-vous sur de vouloir reinitialiser les meilleurs temps de ce jeu?';
        this.messageDeleteGame = 'Êtes-vous sur de vouloir supprimer ce jeu?';
    }
    openDialog(): void {
        this.gameService.rankingSoloCopy = this.card.rankingSolo;
        this.gameService.rankingMultiCopy = this.card.rankingMulti;
        const dialogRef = this.dialog.open(NamePopupComponent, {
            data: { name: this.name, gameName: this.card.gameName, gameType: 'solo' },
            disableClose: true,
            panelClass: 'custom-dialog-container',
            minHeight: 'fit-content',
            minWidth: 'fit-content',
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.name = result;
        });
    }
    ngOnInit(): void {
        this.url = this.router.url;
    }
    launchDialog(): void {
        const dialogRef = this.dialog.open(NamePopupComponent, {
            data: { name: this.name, gameName: this.card.gameName, gameType: 'double' },
            disableClose: true,
            panelClass: 'custom-dialog-container',
            minHeight: 'fit-content',
            minWidth: 'fit-content',
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.name = result;
        });
    }
    changeButton(): string {
        switch (this.url) {
            case '/classique': {
                this.typePage = 'Classique';
                this.createJoinState = this.gameCardHandlerService.toggleCreateJoin(this.card.gameName);
                return this.typePage;
            }
            case '/config': {
                this.typePage = 'Configuration';
                return this.typePage;
            }
        }
        return '';
    }
    async onDelete(gameName: string) {
        try {
            await firstValueFrom(this.gameService.deleteGame(gameName));
            this.gameDeleted.emit();
        } catch (error) {
            alert('la suppression du jeu a échoué');
        }
    }
    async onReinitialise(gameName: string) {
        this.gameService.deleteOneGameRecords(gameName).subscribe();
    }
    launchFeedbackResetSpecificGameRecords(gameName: string, showedMessage: string): void {
        this.dialog
            .open(VerificationFeedbackComponent, {
                data: { message: showedMessage, confirmFunction: async () => this.onReinitialise(gameName) },
                disableClose: true,
                panelClass: 'custom-dialog-container',
                minHeight: 'fit-content',
                minWidth: 'fit-content',
            })
            .afterClosed()
            .subscribe();
    }
    launchFeedbackDeleteGame(gameName: string, showedMessage: string): void {
        this.dialog
            .open(VerificationFeedbackComponent, {
                data: { message: showedMessage, confirmFunction: async () => this.onDelete(gameName) },
                disableClose: true,
                panelClass: 'custom-dialog-container',
                minHeight: 'fit-content',
                minWidth: 'fit-content',
            })
            .afterClosed()
            .subscribe();
    }
}
