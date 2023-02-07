import { Injectable } from '@angular/core';
import { GameInformation } from '@app/interfaces/game-information';
import { ImagePath } from '@app/interfaces/hint-diff-path';
import { SocketClientService } from './socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    path: ImagePath = {
        differenceNotFound: '../../../assets/img/difference-not-found.png',
        differenceFound: '../../../assets/img/difference-found.png',
        hintUnused: '../../../assets/img/hint-unused.png',
        hintUsed: '../../../assets/img/hint-used.png',
    };

    gameInformation: GameInformation = {
        gameTitle: 'Titre du jeu',
        gameMode: 'Partie Classique en mode solo',
        nDifferences: 8,
        nHints: 3,
        hintsPenalty: 5,
        isClassical: true,
    };

    nDifferencesNotFound: number = this.gameInformation.nDifferences;
    nDifferencesFound: number = 0;
    differencesArray: string[] = new Array(this.nDifferencesNotFound);
    isGameFinished: boolean = false;

    nHintsUnused: number = this.gameInformation.nHints;
    nHintsUsed: number = 0;
    hintsArray: string[] = new Array(this.nHintsUnused);

    constructor(private readonly socket: SocketClientService) {}

    clickGetHints(): void {
        if (this.nDifferencesFound < this.nDifferencesNotFound) {
            if (this.nHintsUsed < this.nHintsUnused) {
                this.nHintsUsed++;
                this.hintsArray.shift();
                this.hintsArray.push(this.path.hintUsed);
                this.socket.addTime(this.gameInformation.hintsPenalty);
            }
        }
    }

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
            // this.socket.stopTimer();
            this.isGameFinished = true;
        }
    }

    playSuccessAudio(): void {
        const audio = new Audio();
        audio.src = '../../assets/sounds/yay-6120.mp3';
        audio.load();
        audio.play();
    }

    playFailureAudio(): void {
        const audio = new Audio();
        audio.src = '../../assets/sounds/wronganswer-37702.mp3';
        audio.load();
        audio.play();
    }
}
