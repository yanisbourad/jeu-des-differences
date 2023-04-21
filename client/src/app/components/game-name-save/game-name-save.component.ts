import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GeneralFeedbackComponent } from '@app/components/general-feedback/general-feedback.component';
import { GameDatabaseService } from '@app/services/game/game-database.service';
import { ImageDiffService } from '@app/services/image-diff/image-diff.service';

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

    //  we need to disable max-params because we need to use both two services and at
    // the same time MatdialogRef, MatDialog and Router to navigate to the right page
    // On a utilisé 2 params additionnels <Matdialog, MatdialogRef> dans le constructeur
    // pour permettre d'appeler un autre modal permettant de sauvegarder le nom du joueur
    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<GameNameSaveComponent>,
        private differenceService: ImageDiffService,
        private readonly gameDataBase: GameDatabaseService,
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

    getGameData(): void {
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
                    this.launchFeedback('Ce nom est déjà utilisé. Veillez choisir un autre nom de jeu.');
                }
            });
        }
        this.gameName = '';
    }

    closeOnAbort(): void {
        this.dialogRef.close();
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
