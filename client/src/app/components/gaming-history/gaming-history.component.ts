import { AfterContentChecked, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
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

    constructor(private readonly gameDatabaseService: GameDatabaseService, public dialogReff: MatDialogRef<GamingHistoryComponent>) {
        this.hasGameRecords = false;
        this.gamingHistory = [];
        this.gamingHistory = this.getAllGamingHistory();
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

    async eraseGamingHistory() {
        this.gameDatabaseService.deleteGamingHistory().subscribe((res) => {
            if (res.status === this.gameDatabaseService.twoHundredOkResponse) {
                this.gamingHistory = [];
            }
            this.hasGameRecords = false;
        });
    }

    close() {
        this.dialogReff.close();
    }
}
