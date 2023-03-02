import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameDatabaseService } from '@app/services/game-database.service';
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
    // eslint-disable-next-line max-params
    constructor(
        public dialogRef: MatDialogRef<GameNameSaveComponent>,
        private readonly gameDataBase: GameDatabaseService,
        private differenceService: ImageDiffService,
        private router: Router,
    ) {
        this.gameName = '';
        this.showFeedback = '';
        this.level = this.differenceService.getDifficulty();
        this.lowerLengthNameLimit = 2;
        this.upperLengthNameLimit = 10;
    }

    validateGameName(name: string): boolean {
        const len = name.trim() === '';
        if (!len && name.length > this.lowerLengthNameLimit && name.length < this.upperLengthNameLimit) return true;
        return false;
    }

    getGameData() {
        if (this.validateGameName(this.gameName.toLocaleLowerCase())) {
            if (!this.gameDataBase.saveGame(this.gameName)) {
                alert('/"Nom indisponible: Entrer un autre nom SVP!/"');
            }
            this.level = '';
            this.showFeedback = '';
            this.dialogRef.close();
            this.router.navigate(['/config']);
        }
        this.gameName = '';
    }

    closeOnAbort() {
        this.dialogRef.close();
    }
}
