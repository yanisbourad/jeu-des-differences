import { Component } from '@angular/core';
import { ImagePath } from '@app/interfaces/image-diff-path';
import { TimeService } from '@app/services/time.service';
import * as constants from '@app/configuration/const-canvas';
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    // TODO: Remove the magic numbers and replace them with constants
    //  Pleas look at configuration directory
    readonly defaultWidth = constants.defaultWidth;
    readonly defaultHeight = constants.defaultHeight;
    path: ImagePath = {
        path1: '../../../assets/img/differenceEye.png',
        path2: '../../../assets/img/eyeFound.png',
    };
    // magic numbers will be changed to server values once implemented
    gameName: string;
    gameInfos: string;
    nbrdifferences: number = 8;
    differences: string[] = new Array(this.nbrdifferences);
    differencesFound: number = 0;
    isFound: boolean = false;

    // in infos component change display depending of the game mode (solo, multijoueur, temps limite)
    constructor(private readonly timeService: TimeService) {
        this.generateImage();
    }

    generateImage(): void {
        // generate image
        for (let i = 0; i < this.nbrdifferences; i++) {
            this.differences[i] = this.path.path1;
        }
    }

    clicked(): void {
        if (this.differencesFound < this.nbrdifferences) {
            this.differencesFound++;
            this.differences.pop();
            this.differences.unshift(this.path.path2);
        }
        if (this.differencesFound === this.nbrdifferences) {
            this.timeService.stopTimer();
        }
    }
    giveUp(): void {
        /* feedback message : {Êtes-vous sur de vouloir abandonner la partie? Cette action est irréversible.}
        // if yes do
            // stop game
            // save infos???
            // redirect user to main page
        // else close modal and continue the game
        */
    }
}
