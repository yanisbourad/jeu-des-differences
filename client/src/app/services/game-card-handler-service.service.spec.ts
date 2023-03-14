import { TestBed } from '@angular/core/testing';

import { Router } from '@angular/router';
import { GameCardHandlerService } from './game-card-handler-service.service';

describe('GameCardHandlerService', () => {
    let service: GameCardHandlerService;
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: Router,
                    useValue: routerSpy,
                },
            ],
        });
        service = TestBed.inject(GameCardHandlerService);
        // service.socket = new SocketTestHelper() as unknown as Socket;
        service.games.set('test', 1);
        service.games.set('toaster', 0);
        service.games.set('dad', 0);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should return game state as function being called', () => {
        expect(service.getGameState()).toBe('');
    });
    it('should return if player is the game creator as function being called', () => {
        expect(service.getCreatorStatus()).toBeFalsy();
    });
    it('should return readiness state of the game function being called', () => {
        expect(service.getReadinessStatus()).toBe(false);
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
    it('should redirect player as method is being called', () => {
        service.redirect({
            id: 1,
            name: 'test',
            opponentName: 'test',
            gameName: 'test',
        });
        expect(routerSpy.navigate).toHaveBeenCalled();
    });
});
