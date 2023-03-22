import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GeneralFeedbackComponent } from '@app/components/general-feedback/general-feedback.component';
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
        public dialog: MatDialog,
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
        this.launchFeedback('Le nom du jeu doit être compris entre 3 et 10 caractères.');
        return false;
    }

    getGameData() {
        if (this.validateGameName(this.gameName.toLocaleLowerCase())) {
            const isSaved = this.gameDataBase.saveGame(this.gameName);
            isSaved.subscribe((response) => {
                isSaved.unsubscribe();
                if (response) {
                    this.level = '';
                    this.showFeedback = '';
                    this.dialogRef.close();
                    this.router.navigate(['/config']);
                    this.launchFeedback('Votre Jeu a été sauvegardée avec succès!');
                } else {
                    this.showFeedback = 'The game was not saved';
                    this.launchFeedback('Ce nom est déjà utilisé, Veille choisir un autre.');
                }
            });
        }
        this.gameName = '';
    }

    closeOnAbort() {
        this.dialogRef.close();
    }

    launchFeedback(showedMessage: string): void {
        this.dialog.open(GeneralFeedbackComponent, {
            data: { message: showedMessage },
            disableClose: true,
        });
    }
}
