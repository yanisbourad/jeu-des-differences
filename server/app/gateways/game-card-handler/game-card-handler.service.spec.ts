import { Test, TestingModule } from '@nestjs/testing';
import { GameCardHandlerService } from './game-card-handler.service';

describe('GameCardHandlerService', () => {
    let service: GameCardHandlerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameCardHandlerService],
        }).compile();

        service = module.get<GameCardHandlerService>(GameCardHandlerService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should be falsy when gameQueue is empty', () => {
        expect(service.findAllGamesStatus()).toEqual({});
    });

    it('should return number of player added to the map', () => {
        service.gamesQueue.set('uno', ['rac']);
        service.gamesQueue.set('dos', ['ric', 'tic']);
        expect(service.findAllGamesStatus()).toEqual({ uno: 1, dos: 2 });
    });

    it('should return true if player is waiting', () => {
        service.gamesQueue.set('uno', ['rac']);
        expect(
            service.isPlayerWaiting({
                id: 'rac',
                name: 'John Do',
                gameName: 'uno',
            }),
        ).toBeTruthy();
    });

    it('should be false as no player is waiting', () => {
        expect(
            service.isPlayerWaiting({
                id: 'duo',
                name: 'Pablo',
                gameName: 'uno',
            }),
        ).toBeFalsy();
    });

    it('should be true as a player is waiting', () => {
        service.gamesQueue.set('duo', ['rac']);
        expect(
            service.isPlayerWaiting({
                id: 'gad',
                name: 'Pablo',
                gameName: 'duo',
            }),
        ).toBe(true);
    });

    it('should be 2 as one player is waiting', () => {
        service.gamesQueue.set('uno', ['rac']);
        expect(
            service.dispatchPlayer({
                id: 'duo',
                name: 'Pablo',
                gameName: 'uno',
            }),
        ).toBe(2);
    });

    it('should return 1 if player is waiting', () => {
        const spy = jest.spyOn(service, 'isPlayerWaiting');
        service.gamesQueue.set('uno', []);
        expect(service.stackPlayer({ id: 'ric', name: 'Mat', gameName: 'uno' })).toBe(1);
        expect(spy).toHaveBeenCalled();
    });

    it('should return 2 if player is waiting', () => {
        const spy = jest.spyOn(service, 'dispatchPlayer');
        service.gamesQueue.set('uno', ['rac']);
        expect(service.stackPlayer({ id: 'ric', name: 'Mat', gameName: 'uno' })).toBe(2);
        expect(spy).toHaveBeenCalled();
    });

    it('should return both 2 players', () => {
        service.gamesQueue.set('uno', ['rac', 'ric']);
        service.players.set('rac', { id: 'rac', name: 'Bad', gameName: 'uno' });
        service.players.set('ric', { id: 'ric', name: 'Best', gameName: 'uno' });
        expect(service.acceptOpponent('rac')).toEqual([
            { id: 'rac', name: 'Bad', gameName: 'uno' },
            { id: 'ric', name: 'Best', gameName: 'uno' },
        ]);
    });

    it('should return as oponent was deleted', () => {
        service.gamesQueue.set('uno', ['rac', 'ric']);
        service.players.set('rac', { id: 'rac', name: 'Bad', gameName: 'uno' });
        service.players.set('ric', { id: 'ric', name: 'Best', gameName: 'uno' });
        expect(JSON.stringify(service.deleteOponent('ric'))).toBe(JSON.stringify({ id: 'ric', name: 'Best', gameName: 'uno' }));
    });
});
