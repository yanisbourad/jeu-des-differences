import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GamingHistoryComponent } from '@app/components/gaming-history/gaming-history.component';
import { TimePopupComponent } from '@app/components/time-popup/time-popup.component';
import { VerificationFeedbackComponent } from '@app/components/verification-feedback/verification-feedback.component';
import { GameDatabaseService } from '@app/services/game/game-database.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    @Input() iconUsed: boolean;
    newUrl: string;
    readonly logo: string = 'https://cdn-icons-png.flaticon.com/512/8464/8464334.png';
    readonly title: string = 'VQ';
    messageDeleteGames: string;
    messageDeleteRecords: string;
    constructor(public dialog: MatDialog, public router: Router, readonly gameDatabaseService: GameDatabaseService) {
        this.messageDeleteGames = 'Êtes-vous sur de vouloir supprimer tous les jeux?';
        this.messageDeleteRecords = 'Êtes-vous sur de vouloir reinitialiser tous les meilleurs temps?';
    }
    openSettings(): void {
        const dialogRef = this.dialog.open(TimePopupComponent, {
            height: '774px',
            width: '1107px',
        });
        dialogRef.afterClosed();
    }
    openGamingHistory(): void {
        const dialogRef = this.dialog.open(GamingHistoryComponent, {
            height: '774px',
            width: '1107px',
            disableClose: true,
            panelClass: 'custom-history',
        });
        dialogRef.afterClosed();
    }

    async eraseGameRecords() {
        this.gameDatabaseService.deleteGameRecords().subscribe();
    }
    redirect(): boolean {
        this.newUrl = this.router.url.split(';')[0];
        return this.newUrl !== '/game';
    }

    resetGames(): void {
        this.gameDatabaseService.deleteAllGames().subscribe();
    }
    launchFeedbackResetGames(showedMessage: string): void {
        this.dialog
            .open(VerificationFeedbackComponent, {
                data: { message: showedMessage, confirmFunction: () => this.resetGames() },
                disableClose: true,
                panelClass: 'custom-dialog-container',
                minHeight: 'fit-content',
                minWidth: 'fit-content',
            })
            .afterClosed()
            .subscribe();
    }
    launchFeedbackResetRecords(showedMessage: string): void {
        this.dialog
            .open(VerificationFeedbackComponent, {
                data: { message: showedMessage, confirmFunction: async () => this.eraseGameRecords() },
                disableClose: true,
                panelClass: 'custom-dialog-container',
                minHeight: 'fit-content',
                minWidth: 'fit-content',
            })
            .afterClosed()
            .subscribe();
    }
}
