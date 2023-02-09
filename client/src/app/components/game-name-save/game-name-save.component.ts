import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GameDatabaseService } from '@app/services/game-database.sercice';
import { ImageDiffService } from '@app/services/image-diff.service';

@Component({
    selector: 'app-game-name-save',
    templateUrl: './game-name-save.component.html',
    styleUrls: ['./game-name-save.component.scss'],
})
export class GameNameSaveComponent {
    gameName: string;
    level: string;
    showFeedback: string;
    constructor(
        public dialogRef: MatDialogRef<GameNameSaveComponent>,
        private readonly gameDataBase: GameDatabaseService,
        private differenceService: ImageDiffService,
    ) {
        this.gameName = '';
        this.showFeedback = '';
        this.level = this.differenceService.getDifficulty();
    }

    getGameData() {
        if (this.gameName) {
            this.gameDataBase.saveGame(this.gameName).subscribe((res: boolean) => {
                if (!res) {
                    console.log(res);
                    alert('/"Nom indisponible: Entrer un autre nom SVP!/"');
                } else {
                    this.dialogRef.close();
                    this.level = '';
                    this.showFeedback = '';
                }
            });
            this.gameName = '';
        }
    }
    closeOnAbort() {
        this.dialogRef.close();
    }
}
