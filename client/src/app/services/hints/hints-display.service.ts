import { Injectable } from '@angular/core';
import { HintsService } from './hints.service';

export interface ImagePathHints {
    hintsNotUsed: string;
    hintsUsed: string;
}

@Injectable({
    providedIn: 'root',
})
export class HintsDisplayService {
    path: ImagePathHints;
    hintsArray: string[] = [];
    totalHints: number = 3;
    nHintsLeft: number = this.hintsService.nHintsLeft;

    constructor(private readonly hintsService: HintsService) {
        this.hintsArray = new Array(this.totalHints);
        this.path = {
            hintsNotUsed: './assets/img/hint-not-used.png',
            hintsUsed: './assets/img/hint-used.png',
        };
        this.setIcons();
    }

    setIcons(): void {
        for (let i = 0; i < this.totalHints; i++) {
            this.hintsArray[i] = this.path.hintsNotUsed;
        }
    }

    useHint(): void {
        this.nHintsLeft--;
        this.hintsService.activateHints();
        this.hintsArray.shift();
        this.hintsArray.push(this.path.hintsUsed);
    }
}
