import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
// eslint-disable-next-line no-restricted-imports
import { GeneralFeedbackComponent } from '../general-feedback/general-feedback.component';
// eslint-disable-next-line no-restricted-imports
import { PlayerWaitPopupComponent } from '../player-wait-popup/player-wait-popup.component';

export interface DialogData {
    name: string;
}
@Component({
    selector: 'app-name-popup',
    templateUrl: './name-popup.component.html',
    styleUrls: ['./name-popup.component.scss'],
})
export class NamePopupComponent implements OnInit {
    name: string;
    lowerLimitNameLength: number;
    upperLimitNameLength: number;
    // eslint-disable-next-line max-params
    constructor(
        public dialogRef: MatDialogRef<NamePopupComponent>,
        public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: { name: string; gameName: string; gameType: string },
        private route: Router,
    ) {
        this.name = '';
        this.lowerLimitNameLength = 2;
        this.upperLimitNameLength = 10;
    }
    ngOnInit(): void {
        this.data.name = ' ';
    }
    onNoClick(): void {
        this.dialogRef.close();
    }

    launchFeedback(showedMessage: string): void {
        const dialog = this.dialog.open(GeneralFeedbackComponent, {
            data: { message: showedMessage },
            disableClose: true,
        });
        dialog.afterClosed().subscribe((result) => {
            this.name = result;
        });
    }

    launchDialog(): void {
        if (this.validatePlayerName(this.data.name) === false) {
            const message = 'Veuillez entrer un nom valide (2-10 caractères alphanumeriques).';
            this.launchFeedback(message);
            return;
        }
        const dialog = this.dialog.open(PlayerWaitPopupComponent, {
            data: { name: this.data.name, gameName: this.data.gameName, gameType: 'double' },
            disableClose: true,
            height: '600px',
            width: '600px',
        });
        dialog.afterClosed().subscribe((result) => {
            this.name = result;
        });
    }

    validatePlayerName(name: string): boolean {
        const len = name.trim() === '';
        if (
            !len &&
            name.length > this.lowerLimitNameLength &&
            name.length < this.upperLimitNameLength &&
            !name.startsWith('<') &&
            !name.endsWith('>')
        )
            return true;
        return false;
    }

    redirect(): void {
        if (this.data.gameType === 'solo') this.route.navigate(['/game', { player: this.data.name, gameName: this.data.gameName, gameType: 'solo' }]);
        if (this.data.gameType === 'double') this.launchDialog();
    }
}
