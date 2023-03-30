import { AfterContentChecked, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GameDatabaseService } from '@app/services/game-database.service';
import { GameRecord } from '@common/game';

@Component({
    selector: 'app-gaming-history',
    templateUrl: './gaming-history.component.html',
    styleUrls: ['./gaming-history.component.scss'],
})
export class GamingHistoryComponent implements AfterContentChecked {
    gameRecords: GameRecord[];
    hasGameRecords: boolean;

    constructor(private readonly gameDatabaseService: GameDatabaseService, public dialogReff: MatDialogRef<GamingHistoryComponent>) {
        this.hasGameRecords = false;
        this.gameRecords = [];
        this.gameRecords = this.getAllGameRecords();
    }

    ngAfterContentChecked(): void {
        if (!this.hasGameRecords) this.hasGameRecords = this.getAllGameRecords().length > 0;
    }

    getAllGameRecords(): GameRecord[] {
        this.gameDatabaseService.getAllGamingHistory().subscribe((res) => {
            if (res) this.gameRecords = res;
        });
        return this.gameRecords;
    }

    async eraseGamingHistory() {
        this.gameDatabaseService.deleteGamingHistory().subscribe((res) => {
            if (res.status === this.gameDatabaseService.twoHundredOkResponse) {
                this.gameRecords = [];
            }
            this.hasGameRecords = false;
        });
    }

    close() {
        this.dialogReff.close();
    }
}
