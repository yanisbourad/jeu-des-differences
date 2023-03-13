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
        expect(Array.from(service.findAllGamesStatus(['rac']))).toEqual(Array.from(new Map<string, number>()));
    });

    it('should return number of player added to the map', () => {
        service.gamesQueue.set('uno', ['rac']);
        service.gamesQueue.set('dos', ['ric', 'tic']);
        const map = new Map<string, number>();
        map.set('dac', 0);
        expect(Array.from(service.findAllGamesStatus(['dac']))).toEqual(Array.from(map));
    });
    it('should return 0 or 1 or 2 for each game as players are waiting', () => {
        service.gamesQueue.set('uno', ['rac']);
        service.gamesQueue.set('dos', ['ric', 'tic']);
        const map = new Map<string, number>();
        map.set('uno', 1);
        map.set('dos', 2);
        expect(Array.from(service.updateGameStatus())).toEqual(Array.from(map));
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
    it('should add joining players to Queue as more than 1 player are joining', () => {
        service.gamesQueue.set('uno', ['rac', 'bac']);
        expect(
            service.dispatchPlayer({
                id: 'duo',
                name: 'Pablo',
                gameName: 'uno',
            }),
        ).toBe(0);
        expect(service.joiningPlayersQueue.get('uno').length).toBe(1);
    });
    it('should add joining players to Queue as more than 1 player are joining', () => {
        service.gamesQueue.set('uno', ['rac', 'bac']);
        service.dispatchPlayer({
            id: 'back',
            name: 'Peter',
            gameName: 'uno',
        });
        expect(
            service.dispatchPlayer({
                id: 'duo',
                name: 'Pablo',
                gameName: 'uno',
            }),
        ).toBe(0);
        expect(service.joiningPlayersQueue.get('uno').length).toBe(2);
    });
    it('should be 0 as more than 1 player is joining', () => {
        service.gamesQueue.set('uno', ['rac', 'bac']);
        expect(
            service.dispatchPlayer({
                id: 'duo',
                name: 'Pablo',
                gameName: 'uno',
            }),
        ).toBe(0);
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
    it('should return stacked players that are about to play', () => {
        service.gamesQueue.set('uno', ['rac', 'ric']);
        expect(service.getStackedPlayers('uno').length).toBe(2);
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

    it('should return player object if there is the provided player id', () => {
        service.players.set('rac', { id: 'rac', name: 'Bad', gameName: 'uno' });
        expect(service.getPlayer('rac')).toEqual({ id: 'rac', name: 'Bad', gameName: 'uno' });
    });
    it('should return null if there is no such player id', () => {
        service.players.set('rac', { id: 'rac', name: 'Bad', gameName: 'uno' });
        expect(service.getPlayer('ric')).toEqual(null);
    });
});
