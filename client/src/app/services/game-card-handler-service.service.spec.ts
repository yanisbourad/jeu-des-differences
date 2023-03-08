import { TestBed } from '@angular/core/testing';

import { GameCardHandlerServiceService } from './game-card-handler-service.service';

describe('GameCardHandlerServiceService', () => {
    let service: GameCardHandlerServiceService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameCardHandlerServiceService);
        service.allGames = new Map<string, number>();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return creer with value 0 for corresponding game name', () => {
        service.allGames.set('toast', 0);
        expect(service.toggleCreateJoin('toast')).toEqual('Créer');
    });
    it('should return creer when game name is not a key', () => {
        service.allGames.set('test', 1);
        expect(service.toggleCreateJoin('motion')).toEqual('Créer');
    });
    it('should return joindre with value 1 for corresponding game name', () => {
        service.allGames.set('test', 1);
        expect(service.toggleCreateJoin('test')).toEqual('Joindre');
    });
});
