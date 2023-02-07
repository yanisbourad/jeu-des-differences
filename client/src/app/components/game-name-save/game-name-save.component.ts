import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GameDatabaseService } from '@app/services/game-database.sercice';

@Component({
    selector: 'app-game-name-save',
    templateUrl: './game-name-save.component.html',
    styleUrls: ['./game-name-save.component.scss'],
})
export class GameNameSaveComponent {
    gameName: string;
    level: string;
    constructor(public dialogRef: MatDialogRef<GameNameSaveComponent>, private readonly gameDataBase: GameDatabaseService) {
        this.gameName = 'No Name';
        this.level = 'facile';
    }

    getGameData() {
        this.gameDataBase.saveGame(this.gameName);
        this.dialogRef.close();
    }
    closeOnAbort() {
        this.dialogRef.close();
    }
}
