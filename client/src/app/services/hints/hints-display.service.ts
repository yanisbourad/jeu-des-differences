import { Injectable } from '@angular/core';

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

    constructor() {
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

    updateIcons(): void {
        this.hintsArray.shift();
        this.hintsArray.push(this.path.hintsUsed);
    }
}
