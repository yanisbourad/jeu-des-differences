import { Test, TestingModule } from '@nestjs/testing';
import { FAKE_QUEUE, OVER_CROWDED } from './entities/constants';
import { Player } from './entities/player.entity';
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

    it('should return true if player is about to play', () => {
        service.gamesQueue.set('uno', ['rac']);
        expect(service.isAboutToPlay('rac', 'uno')).toBeTruthy();
    });
    it('should delete game name in stacks', () => {
        service.gamesQueue.set('uno', ['rac', 'tic']);
        service.joiningPlayersQueue.set('uno', ['gad']);
        service.deleteGame('uno');
        expect(service.gamesQueue.has('uno')).toBeFalsy();
        expect(service.joiningPlayersQueue.has('uno')).toBeFalsy();
    });
    it('should return all players id in the queues', () => {
        service.gamesQueue.set('uno', ['rac', 'tic']);
        service.joiningPlayersQueue.set('uno', ['gad']);
        const players = service.deleteAllWaitingPlayerByGame('uno');
        expect(JSON.stringify(players)).toBe(JSON.stringify(['rac', 'tic', 'gad']));
    });
    it('should return false if player is not in the gameQueue', () => {
        service.gamesQueue.set('uno', ['rac']);
        expect(service.isAboutToPlay('brad', 'uno')).toBeFalsy();
    });
    it('should return creator id', () => {
        service.gamesQueue.set('uno', ['rac']);
        expect(service.getCreatorId('uno')).toBe('rac');
    });
    it('should return true if player is the creator', () => {
        service.gamesQueue.set('uno', ['rac']);
        expect(service.isCreator('rac', 'uno')).toBeTruthy();
    });
    it('should return false if player is not the creator', () => {
        service.gamesQueue.set('uno', ['rac']);
        expect(service.isCreator('brad', 'uno')).toBeFalsy();
    });

    // test for deleteCreator
    it('should return the player creator id', () => {
        service.gamesQueue.set('uno', ['rac']);
        expect(JSON.stringify(service.deleteCreator('uno'))).toBe(JSON.stringify(['rac']));
        expect(JSON.stringify(service.gamesQueue.get('uno'))).toBe(JSON.stringify([]));
    });

    // test for removeOpponent
    it('should return the player opponent id', () => {
        service.gamesQueue.set('uno', ['rac', 'bac']);
        service.joiningPlayersQueue.set('uno', []);
        expect(JSON.stringify(service.removeOpponent('uno'))).toBe(JSON.stringify(['bac']));
        expect(JSON.stringify(service.gamesQueue.get('uno'))).toBe(JSON.stringify(['rac']));
    });

    it('should return the player opponents ids', () => {
        service.gamesQueue.set('uno', ['rac', 'bac']);
        service.joiningPlayersQueue.set('uno', ['gad']);
        expect(JSON.stringify(service.removeOpponent('uno'))).toBe(JSON.stringify(['bac', 'gad']));
        expect(JSON.stringify(service.gamesQueue.get('uno'))).toBe(JSON.stringify(['rac', 'gad']));
    });

    // test for deletePlayer
    it('should return the player id', () => {
        service.players.set('rac', {
            id: 'rac',
            name: 'John Do',
            gameName: 'uno',
            gameType: 'classic',
        });
        service.gamesQueue.set('uno', ['rac']);
        expect(JSON.stringify(service.deletePlayer('rac'))).toBe(
            JSON.stringify({
                id: 'rac',
                name: 'John Do',
                gameName: 'uno',
                gameType: 'classic',
            }),
        );
    });

    it('should return true if player is waiting', () => {
        service.gamesQueue.set('uno', ['rac']);
        const player: Player = {
            id: 'rac',
            name: 'John Do',
            gameName: 'uno',
            gameType: 'classic',
        };
        expect(service.isPlayerWaiting(player)).toBeTruthy();
    });

    it('should be true as a player is waiting', () => {
        service.gamesQueue.set('duo', ['rac']);
        expect(
            service.isPlayerWaiting({
                id: 'gad',
                name: 'Pablo',
                gameName: 'duo',
                gameType: 'classic',
            }),
        ).toBeTruthy();
    });

    it('should be 2 as one player is waiting', () => {
        service.gamesQueue.set('uno', ['rac']);
        expect(
            service.dispatchPlayer({
                id: 'duo',
                name: 'Pablo',
                gameName: 'uno',
                gameType: 'classic',
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
                gameType: 'classic',
            }),
        ).toBe(3);
        expect(service.joiningPlayersQueue.get('uno').length).toBe(1);
    });
    it('should add two more joining players to joining Queue', () => {
        service.gamesQueue.set('uno', ['rac', 'bac']);
        service.dispatchPlayer({
            id: 'back',
            name: 'Peter',
            gameName: 'uno',
            gameType: 'classic',
        });
        expect(
            service.dispatchPlayer({
                id: 'duo',
                name: 'Pablo',
                gameName: 'uno',
                gameType: 'classic',
            }),
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        ).toBe(4);
        expect(service.joiningPlayersQueue.get('uno').length).toBe(2);
    });
    it('should be 3 players are in the queue as a third player is joining', () => {
        service.gamesQueue.set('uno', ['rac', 'bac']);
        expect(
            service.dispatchPlayer({
                id: 'duo',
                name: 'Pablo',
                gameName: 'uno',
                gameType: 'classic',
            }),
        ).toBe(3);
    });
    it('should return big number when more than 25 players are joining', () => {
        service.gamesQueue.set('uno', ['rac', 'bac']);
        service.joiningPlayersQueue.set('uno', FAKE_QUEUE);
        expect(
            service.dispatchPlayer({
                id: 'z',
                name: 'Pablo',
                gameName: 'uno',
                gameType: 'classic',
            }),
        ).toBe(OVER_CROWDED);
    });
    it('should remove player id from joining queue', () => {
        service.gamesQueue.set('uno', ['rac', 'bac']);
        service.joiningPlayersQueue.set('uno', ['tas', 'z', 'dos', 'tres']);
        expect(service.removePlayerInJoiningQueue('uno', 'z')).toBeTruthy();
    });
    it('should return false if player is not in joining queue', () => {
        service.gamesQueue.set('uno', ['rac', 'bac']);
        service.joiningPlayersQueue.set('uno', ['tas', 'z', 'dos', 'tres']);
        expect(service.removePlayerInJoiningQueue('uno', 'gad')).toBeFalsy();
    });
    it('should return 1 if player is waiting', () => {
        const spy = jest.spyOn(service, 'isPlayerWaiting');
        service.gamesQueue.set('uno', []);
        service.joiningPlayersQueue.set('uno', []);
        expect(service.stackPlayer({ id: 'ric', name: 'Mat', gameName: 'uno', gameType: 'classic' })).toBe(1);
        expect(spy).toHaveBeenCalled();
    });
    it('should return 2 if player is waiting', () => {
        const spy = jest.spyOn(service, 'dispatchPlayer');
        service.gamesQueue.set('uno', ['rac']);
        expect(service.stackPlayer({ id: 'ric', name: 'Mat', gameName: 'uno', gameType: 'classic' })).toBe(2);
        expect(spy).toHaveBeenCalled();
    });
    it('should return stacked players that are about to play', () => {
        service.gamesQueue.set('uno', ['rac', 'ric']);
        expect(service.getStackedPlayers('uno').length).toBe(2);
    });
    it('should return 0 as no player is waiting', () => {
        service.gamesQueue.set('uno', []);
        service.joiningPlayersQueue.set('uno', []);
        expect(service.getTotalRequest('uno')).toBe(0);
    });
    it('should return both 2 players', () => {
        service.gamesQueue.set('uno', ['rac', 'ric']);
        service.joiningPlayersQueue.set('uno', ['tic', 'gac', 'bac']);
        service.players.set('rac', { id: 'rac', name: 'Bad', gameName: 'uno', gameType: 'classic' });
        service.players.set('ric', { id: 'ric', name: 'Best', gameName: 'uno', gameType: 'classic' });
        expect(service.acceptOpponent('rac')).toEqual([
            { id: 'rac', name: 'Bad', gameName: 'uno', gameType: 'classic' },
            { id: 'ric', name: 'Best', gameName: 'uno', gameType: 'classic' },
        ]);
    });
    it('should return player as oponent was deleted', () => {
        service.gamesQueue.set('uno', ['rac', 'ric']);
        service.players.set('rac', { id: 'rac', name: 'Bad', gameName: 'uno', gameType: 'classic' });
        service.players.set('ric', { id: 'ric', name: 'Best', gameName: 'uno', gameType: 'classic' });
        expect(JSON.stringify(service.deleteOpponent('ric'))).toBe(JSON.stringify({ id: 'ric', name: 'Best', gameName: 'uno', gameType: 'classic' }));
    });
    it('should return player object if there is the provided player id', () => {
        service.players.set('rac', { id: 'rac', name: 'Bad', gameName: 'uno', gameType: 'classic' });
        expect(service.getPlayer('rac')).toEqual({ id: 'rac', name: 'Bad', gameName: 'uno', gameType: 'classic' });
    });
    it('should return null if there is no such player id', () => {
        service.players.set('rac', { id: 'rac', name: 'Bad', gameName: 'uno', gameType: 'classic' });
        expect(service.getPlayer('ric')).toEqual(null);
    });
    it('should return 0 as no player is waiting', () => {
        service.gamesQueue.set('uno', []);
        service.joiningPlayersQueue.set('uno', []);
        expect(JSON.stringify(service.removePlayers('uno'))).toBe(JSON.stringify([]));
    });
    it('should return 1 as one player is waiting', () => {
        service.players.set('rac', { id: 'rac', name: 'Bad', gameName: 'uno', gameType: 'classic' });
        service.gamesQueue.set('uno', ['dac', 'pat']);
        service.joiningPlayersQueue.set('uno', ['rac']);
        expect(JSON.stringify(service.removePlayers('uno'))).toBe(JSON.stringify(['rac']));
    });
    it('should return 1 player is waiting', () => {
        service.players.set('rac', { id: 'rac', name: 'Bad', gameName: 'uno', gameType: 'classic' });
        service.players.set('tas', { id: 'tas', name: 'Baddy', gameName: 'uno', gameType: 'classic' });
        service.gamesQueue.set('uno', ['rac']);
        service.joiningPlayersQueue.set('uno', ['tas']);
        expect(JSON.stringify(service.handleReject('rac'))).toBe(
            JSON.stringify({
                id: 'tas',
                name: 'Baddy',
                gameName: 'uno',
                gameType: 'classic',
            }),
        );
    });
    it('should return null as no player is waiting', () => {
        service.players.set('rac', { id: 'rac', name: 'Bad', gameName: 'uno', gameType: 'classic' });
        service.players.set('tas', { id: 'tas', name: 'Baddy', gameName: 'uno', gameType: 'classic' });
        service.gamesQueue.set('uno', ['rac']);
        service.joiningPlayersQueue.set('uno', []);
        expect(JSON.stringify(service.handleReject('rac'))).toBe(JSON.stringify(null));
    });
    it('should return true if game is available', () => {
        service.gamesQueue.set('uno', ['rac', 'tas']);
        expect(service.isGameAvailable('uno')).toBeTruthy();
        expect(service.isGameAvailable('dos')).toBeFalsy();
    });
    it('should  handle limited time cancel', () => {
        service.players.set('rac', { id: 'rac', name: 'Bad', gameName: 'uno', gameType: 'classic' });
        service.players.set('tas', { id: 'tas', name: 'Baddy', gameName: 'uno', gameType: 'classic' });
        service.timeLimitedGamesQueue.push('rac', 'tas');
        service.joiningPlayersQueue.set('uno', []);
        expect(service.handleLimitedTimeCancel('rac')).toBeTruthy();
    });
    it('should return array of player who is joining', () => {
        expect(JSON.stringify(service.manageJoinLimitMode({ id: 'rac', name: 'Bad', gameName: 'uno', gameType: 'limit' }))).toBe(
            JSON.stringify([{ id: 'rac', name: 'Bad', gameName: 'uno', gameType: 'limit' }]),
        );
    });
    it('should return array of 2 players who are joining', () => {
        service.manageJoinLimitMode({ id: 'rad', name: 'Bad', gameName: 'uno', gameType: 'limit' });
        expect(JSON.stringify(service.manageJoinLimitMode({ id: 'rac', name: 'Bad', gameName: 'uno', gameType: 'limit' }))).toBe(
            JSON.stringify([
                { id: 'rac', name: 'Bad', gameName: 'uno', gameType: 'limit' },
                { id: 'rad', name: 'Bad', gameName: 'uno', gameType: 'limit' },
            ]),
        );
    });
});
