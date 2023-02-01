import { Component, OnInit } from '@angular/core';
import { GameInformation } from '@app/interfaces/game-information';
import { ImagePath } from '@app/interfaces/image-diff-path';
import { TimeService } from '@app/services/time.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    readonly DEFAULT_WIDTH = 640;
    readonly DEFAULT_HEIGHT = 480;

    path: ImagePath = {
        differenceNotFound: '../../../assets/img/difference-not-found.png',
        differenceFound: '../../../assets/img/difference-found.png',
        hintUnused: '../../../assets/img/hint-unused.png',
        hintUsed: '../../../assets/img/hint-used.png',
    };

    gameInformation: GameInformation = {
        gameTitle: 'Game Title',
        gameMode: 'Partie Classique en mode solo',
        nDifferences: 8,
        nHints: 3,
    };

    nDifferencesNotFound: number = this.gameInformation.nDifferences;
    nDifferencesFound: number = 0;
    differencesArray: string[] = new Array(this.nDifferencesNotFound);
    isFound: boolean = false;

    nHintsUnused: number = this.gameInformation.nHints;
    nHintsUsed: number = 0;
    hintsArray: string[] = new Array(this.nHintsUnused);

    // in infos component change display depending of the game mode (solo, multijoueur, temps limite)
    constructor(private readonly timeService: TimeService) {
        this.displayIcons();
    }

    ngOnInit(): void {}

    displayIcons(): void {
        for (let i = 0; i < this.nDifferencesNotFound; i++) {
            this.differencesArray[i] = this.path.differenceNotFound;
        }
        for (let i = 0; i < this.nHintsUnused; i++) {
            this.hintsArray[i] = this.path.hintUnused;
        }
    }

    clickDifferencesFound(): void {
        if (this.nDifferencesFound < this.nDifferencesNotFound) {
            this.nDifferencesFound++;
            this.differencesArray.pop();
            this.differencesArray.unshift(this.path.differenceFound);
        }
        if (this.nDifferencesFound === this.nDifferencesNotFound) {
            this.timeService.stopTimer();
        }
    }

    clickGetHints(): void {
        if (this.nHintsUsed <= this.nHintsUnused) {
            this.nHintsUsed++;
            this.hintsArray.shift();
            this.hintsArray.push(this.path.hintUsed);
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
