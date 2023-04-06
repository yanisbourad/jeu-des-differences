import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GamingHistoryComponent } from '@app/components/gaming-history/gaming-history.component';
import { GeneralFeedbackComponent } from '@app/components/general-feedback/general-feedback.component';
import { TimePopupComponent } from '@app/components/time-popup/time-popup.component';
import { GameDatabaseService } from '@app/services/game-database.service';
// import { GameService } from '@app/services/game.service';
import { VerificationFeedbackComponent } from '@app/components/verification-feedback/verification-feedback.component';

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
    messageDeleteGames: string = "êtes-vous sur de vouloir supprimer tous les jeux? si oui, vous allez être redirigé vers la page d'accueil";
    constructor(public dialog: MatDialog, public router: Router, readonly gameDatabaseService: GameDatabaseService) {}
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
        });
        dialogRef.afterClosed();
    }
    sendFeedback(showedMessage: string): void {
        const dialog = this.dialog.open(GeneralFeedbackComponent, {
            data: { message: showedMessage },
            disableClose: true,
        });
        dialog.afterClosed();
    }

    async eraseGameRecords() {
        this.gameDatabaseService.deleteGameRecords().subscribe((res) => {
            if (res.status === this.gameDatabaseService.twoHundredOkResponse) {
                this.router.navigate(['/home']);
                this.sendFeedback('Tous les meilleurs temps ont été reinitialisés avec succes');
            }
        });
    }
    redirect(): boolean {
        this.newUrl = this.router.url.split(';')[0];
        return this.newUrl !== '/game';
    }

    resetGames(): void {
        this.gameDatabaseService.deleteAllGames().subscribe();
    }
    launchFeedback(showedMessage: string): void {
        this.dialog
            .open(VerificationFeedbackComponent, {
                data: { message: showedMessage, confirmFunction: () => this.resetGames() },
                disableClose: true,
            })
            .afterClosed()
            .subscribe(() => {
                this.router.navigate(['/']);
            });
    }
}
