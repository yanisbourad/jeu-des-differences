import { GameRecordDocument } from '@app/model/database/game-record';
import { Logger } from '@nestjs/common';
import { Model, Query } from 'mongoose';
import { join } from 'path';
import { Game } from './../../../../common/game';
import { GameService } from './game.service';
/**
 * There is two way to test the service :
 * - Mock the mongoose Model implementation and do what ever we want to do with it (see describe GameService) or
 * - Use mongodb memory server implementation (see describe GameServiceEndToEnd) and let everything go through as if we had a real database
 *
 * The second method is generally better because it tests the database queries too.
 * We will use it more
 */

describe('GameService', () => {
    let service: GameService;
    const fs = require('fs');
    beforeEach(async () => {
        // notice that only the functions we call from the model are mocked
        // we can´t use sinon because mongoose Model is an interface and not a class
        const gameRecordModel = {
            find: () => [],
        } as unknown as Model<GameRecordDocument>;
        service = new GameService(gameRecordModel, new Logger());
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(service.rootPath).toEqual(join(process.cwd(), 'assets', 'games'));
    });

    it('should return the key', () => {
        expect(service.getKey).toBeDefined();
    });

    it('should return all games', () => {
        const spyFindRecord = jest.spyOn(service.gameRecordModel, 'find').mockReturnValue({
            sort: () => ({
                limit: () => [],
            }),
        } as unknown as Query<GameRecordDocument[], GameRecordDocument>);

        const spyGetGame = jest.spyOn(service, 'getGame').mockReturnValue({
            gameName: 'test',
            difficulty: 'easy',
            originalImageData: 'test',
            modifiedImageData: 'test',
            listDifferences: [],
        } as Game);
        expect(spyGetGame).toHaveBeenCalledTimes(service.gamesNames.length);
        expect(spyFindRecord).toHaveBeenCalledTimes(service.gamesNames.length * 2);
        expect(service.getAllGames()).toBeDefined();
    });

    it('should return true if the game name is valid', () => {
        expect(service.isValidGameName('test')).toBeTruthy();
    });

    it('should return false if the game name is not valid', () => {
        service.gamesNames.push();
        expect(service.isValidGameName('test')).toBeFalsy();
    });

    it('should save the game', async () => {
        const mokeGame = {
            gameName: 'test',
            difficulty: 'easy',
            originalImageData: 'test',
            modifiedImageData: 'test',
            listDifferences: [],
        } as Game;
        const spyWriteFileSync = jest.spyOn(fs, 'writeFileSync');
        const spyMkdirSync = jest.spyOn(fs, 'mkdirSync');
        const spyExistsSync = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        await service.addGame(mokeGame);
        expect(spyWriteFileSync).toHaveBeenCalled();

        expect(spyExistsSync).toHaveBeenCalledWith(service.rootPath);
        expect(spyMkdirSync).toHaveBeenCalledWith(service.rootPath + '/' + mokeGame.gameName);
        expect(service.gamesNames).toContain(mokeGame.gameName);
    });
    it('should return the game', () => {
        // We need to create a game in the assets folder
        const mokeGame = {
            gameName: 'test',
            difficulty: 'easy',
            originalImageData: 'test',
            modifiedImageData: 'test',
            listDifferences: [],
        } as Game;

        const gameName = 'test';

        service.gamesNames.push(gameName);
        expect(service.getGame(gameName)).toBeDefined();
    });

    it('should throw an error if the game does not exist', () => {
        const gameName = 'test';
        expect(() => service.getGame(gameName)).toThrowError(`Failed to get Game: ${gameName} does not exist`);
    });

    it('should load the key for this server', () => {
        const pathKey = join(process.cwd(), 'assets', 'key.text');
        const spyExistsSync = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        const spyReadFileSync = jest.spyOn(fs, 'readFileSync').mockReturnValue('test');
        service.loadKeyForThisServer();
        expect(spyExistsSync).toHaveBeenCalledWith(pathKey);
        expect(spyReadFileSync).toHaveBeenCalledWith(pathKey, 'utf8');
        expect(service.key).toEqual('test');
    });
});
