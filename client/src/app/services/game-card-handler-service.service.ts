import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class GameCardHandlerServiceService {
    allGames: Map<string, number>;
    constructor() {
        this.allGames = new Map<string, number>();
    }

    toggleCreateJoin(gameName: string): string {
        if (this.allGames.get(gameName) === 1) return 'Joindre';
        return 'Créer';
    }
}
