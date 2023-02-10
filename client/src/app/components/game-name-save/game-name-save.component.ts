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
    lowerLengthNameLimit: number;
    upperLengthNameLimit: number;
    constructor(
        public dialogRef: MatDialogRef<GameNameSaveComponent>,
        private readonly gameDataBase: GameDatabaseService,
        private differenceService: ImageDiffService,
    ) {
        this.gameName = '';
        this.showFeedback = '';
        this.level = this.differenceService.getDifficulty();
        this.lowerLengthNameLimit = 2;
        this.upperLengthNameLimit = 10;
    }

    validateGameName(name: string): boolean {
        const len = name.trim() === '';
        if (!len && (name.length > this.lowerLengthNameLimit || name.length < this.upperLengthNameLimit)) return true;
        return false;
    }

    getGameData() {
        if (this.validateGameName(this.gameName)) {
            this.gameDataBase.saveGame(this.gameName).subscribe((res: boolean) => {
                if (!res) {
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
