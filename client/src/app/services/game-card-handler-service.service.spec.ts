import { TestBed } from '@angular/core/testing';

import { GameCardHandlerService } from './game-card-handler-service.service';

describe('GameCardHandlerService', () => {
    let service: GameCardHandlerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameCardHandlerService);
        service.games.set('test', 1);
        service.games.set('toaster', 0);
        service.games.set('dad', 0);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return creer with value 0 for corresponding game name', () => {
        expect(service.toggleCreateJoin('toaster')).toEqual('Créer');
    });
    it('should return creer when game name is not a key', () => {
        expect(service.toggleCreateJoin('motion')).toEqual('Créer');
    });
    it('should return joindre with value 1 for corresponding game name', () => {
        expect(service.toggleCreateJoin('test')).toEqual('Joindre');
    });
});
