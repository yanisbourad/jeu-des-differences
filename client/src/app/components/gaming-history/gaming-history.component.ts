import { AfterContentChecked, Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VerificationFeedbackComponent } from '@app/components/verification-feedback/verification-feedback.component';
import { GameDatabaseService } from '@app/services/game/game-database.service';
import { GamingHistory } from '@common/game';
@Component({
    selector: 'app-gaming-history',
    templateUrl: './gaming-history.component.html',
    styleUrls: ['./gaming-history.component.scss'],
})
export class GamingHistoryComponent implements AfterContentChecked {
    gamingHistory: GamingHistory[];
    hasGameRecords: boolean;
    statusTwoHundredOk: number;

    constructor(
        private readonly gameDatabaseService: GameDatabaseService,
        public dialogReff: MatDialogRef<GamingHistoryComponent>,
        public dialog: MatDialog,
    ) {
        this.hasGameRecords = false;
        this.gamingHistory = [];
        this.gamingHistory = this.getAllGamingHistory();
        this.statusTwoHundredOk = 200;
    }

    ngAfterContentChecked(): void {
        if (!this.hasGameRecords) this.hasGameRecords = this.getAllGamingHistory().length > 0;
    }

    getAllGamingHistory(): GamingHistory[] {
        this.gameDatabaseService.getAllGamingHistory().subscribe((res) => {
            if (res) this.gamingHistory = res;
        });
        return this.gamingHistory;
    }

    launchFeedback(): void {
        this.dialog
            .open(VerificationFeedbackComponent, {
                data: {
                    message: "Voulez vous vraiment supprimer l'historique des parties?",
                    confirmFunction: () => {
                        this.eraseGamingHistory();
                    },
                },
                disableClose: true,
                panelClass: 'custom-dialog-container',
                minHeight: 'fit-content',
                minWidth: 'fit-content',
            })
            .afterClosed()
            .subscribe();
    }

    async eraseGamingHistory() {
        this.gameDatabaseService.deleteGamingHistory().subscribe((res) => {
            if (res.status === this.statusTwoHundredOk) {
                this.gamingHistory = [];
            }
            this.hasGameRecords = false;
        });
    }

    close() {
        this.dialogReff.close();
    }
}
