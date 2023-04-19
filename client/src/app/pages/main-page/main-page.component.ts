import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GeneralFeedbackComponent } from '@app/components/general-feedback/general-feedback.component';
import { NamePopupComponent } from '@app/components/name-popup/name-popup.component';
import { GameDatabaseService } from '@app/services/game/game-database.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'VISUAL QUEST';
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    name: string;
    constructor(public dialog: MatDialog, private gameDatabase: GameDatabaseService) {}

    openDialog(): void {
        this.gameDatabase.getCount().subscribe((count) => {
            if (count === 0) {
                this.launchFeedback("Il n'y a pas de jeu disponible. Veuillez en créer un pour commencer à jouer.");
                return;
            }
            const dialogRef = this.dialog.open(NamePopupComponent, {
                data: { name: this.name, isTimeLimit: true },
                disableClose: true,
                panelClass: 'custom-dialog-container',
                minHeight: 'fit-content',
                minWidth: 'fit-content',
            });

            dialogRef.afterClosed().subscribe((result) => {
                this.name = result;
            });
        });
    }

    launchFeedback(showedMessage: string): void {
        this.dialog.open(GeneralFeedbackComponent, {
            data: { message: showedMessage },
            disableClose: true,
            panelClass: 'custom-dialog-container',
            minHeight: 'fit-content',
            minWidth: 'fit-content',
        });
    }
}
