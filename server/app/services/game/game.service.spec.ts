import { GameRecordDocument } from '@app/model/database/game-record';
import { Game } from '@common/game';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import { Model, Query } from 'mongoose';
import { join } from 'path';
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
    beforeEach(async () => {
        // notice that only the functions we call from the model are mocked
        // we can´t use sinon because mongoose Model is an interface and not a class
        const gameRecordModel = {
            find: () => [],
            insertMany: () => [],
            deleteMany: () => [],
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

    it('should return all games', async () => {
        const spyFindRecord = jest.spyOn(service.gameRecordModel, 'find').mockReturnValue({
            sort: () => ({
                limit: () => ({
                    exec: () => {
                        return [];
                    },
                }),
            }),
        } as unknown as Query<GameRecordDocument[], GameRecordDocument>);

        const spyGetGame = jest.spyOn(service, 'getGame').mockReturnValue({
            gameName: 'test',
            difficulty: 'easy',
            originalImageData: 'test',
            modifiedImageData: 'test',
            listDifferences: [],
        } as Game);
        const result = await service.getAllGames();
        expect(result).toBeDefined();
        expect(spyGetGame).toHaveBeenCalledTimes(service.gamesNames.length);
        expect(spyFindRecord).toHaveBeenCalledTimes(service.gamesNames.length * 2);
        spyFindRecord.mockRestore();
        spyGetGame.mockRestore();
    });

    it('should return true if the game name is valid', () => {
        const mokeGameName = 'testtfudebhjwks';
        expect(service.isValidGameName(mokeGameName)).toEqual(true);
    });

    it('should return false if the game name is not valid', () => {
        service.gamesNames.push();
        expect(service.isValidGameName('test')).toBeFalsy();
    });

    it('should save the game', async () => {
        const mokeGameName = 'testtfudebhjwks';
        const mokeGame = {
            gameName: mokeGameName,
            difficulty: 'easy',
            originalImageData: 'test',
            modifiedImageData: 'test',
            listDifferences: [],
        } as Game;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spyDbSaveMany = jest.spyOn<any, any>(service.gameRecordModel, 'insertMany').mockImplementation();
        const spyWriteFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation();
        const spyMkdirSync = jest.spyOn(fs, 'mkdirSync').mockImplementation();
        const spyExistsSync = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        await service.addGame(mokeGame);
        expect(spyWriteFileSync).toHaveBeenCalled();
        expect(spyExistsSync).toHaveBeenCalledWith(service.rootPath + '/' + mokeGame.gameName);
        expect(spyMkdirSync).toHaveBeenCalledWith(service.rootPath + '/' + mokeGame.gameName);
        expect(service.gamesNames).toContain(mokeGame.gameName);
        expect(spyDbSaveMany).toHaveBeenCalledTimes(1);
        spyWriteFileSync.mockRestore();
        spyMkdirSync.mockRestore();
        spyExistsSync.mockRestore();
        spyDbSaveMany.mockRestore();
    });

    it('should return the same game as saved game', async () => {
        const mokeGame = {
            gameName: 'fweibj',
            difficulty: 'easy',
            originalImageData: 'test',
            modifiedImageData: 'test',
            listDifferences: [],
        } as Game;
        service.addGame(mokeGame);
        const result = await service.getGame(mokeGame.gameName);
        expect(result).toBeDefined();
        expect(result.gameName).toEqual(mokeGame.gameName);
        expect(result.difficulty).toEqual(mokeGame.difficulty);
        expect(result.originalImageData).toEqual(mokeGame.originalImageData);
        expect(result.modifiedImageData).toEqual(mokeGame.modifiedImageData);
        expect(result.listDifferences).toEqual(mokeGame.listDifferences);
        service.deleteGame(mokeGame.gameName);
    });

    it('should throw an error if the game does not exist', () => {
        const gameName = 'oiklepjoew';
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
        spyExistsSync.mockRestore();
        spyReadFileSync.mockRestore();
    });

    it('should create a new folder for the games if does not exist', () => {
        const spyCreateFile = jest.spyOn(fs, 'writeFileSync');
        const spyValidateKeyExists = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        const spyCreateFolder = jest.spyOn(fs, 'mkdirSync').mockImplementation();
        spyCreateFolder.mockClear();
        spyValidateKeyExists.mockClear();
        spyCreateFile.mockClear();
        const gameRecordModel = {
            find: () => [],
            insertMany: () => [],
            deleteMany: () => [],
        } as unknown as Model<GameRecordDocument>;
        new GameService(gameRecordModel, new Logger());
        expect(spyCreateFolder).toBeCalledTimes(1);
        expect(spyValidateKeyExists).toBeCalledTimes(2);
        const keyPath = join(process.cwd(), 'assets', 'key.text');
        expect(spyValidateKeyExists).toHaveBeenCalledWith(keyPath);
        expect(spyCreateFile).toHaveBeenCalledTimes(1);
        spyCreateFile.mockRestore();
        spyValidateKeyExists.mockRestore();
        spyCreateFolder.mockRestore();
    });

    it('should delete the game', async () => {
        const mokeGame = {
            gameName: 'jkdexwjnd',
            difficulty: 'easy',
            originalImageData: 'test',
            modifiedImageData: 'test',
            listDifferences: [],
        } as Game;
        await service.addGame(mokeGame);
        const spyDeleteGame = jest.spyOn(service, 'deleteDirectory');
        const spyDeleteRecord = jest.spyOn(service.gameRecordModel, 'deleteMany').mockImplementation();
        await service.deleteGame(mokeGame.gameName);
        expect(spyDeleteGame).toBeCalledTimes(1);
        expect(spyDeleteRecord).toBeCalledTimes(1);
        spyDeleteGame.mockRestore();
        spyDeleteRecord.mockRestore();
    });

    it('should throw an error if the game does not exist', async () => {
        const gameName = 'oiklepjoew';
        try {
            await service.deleteGame(gameName);
        } catch (error) {
            expect(error.message).toEqual(`Failed to delete Game: ${gameName} does not exists`);
        }
    });

    it('should delete the directory', () => {
        const spyRmDir = jest.spyOn(fs, 'rm').mockImplementation();
        service.deleteDirectory('a');
        expect(spyRmDir).toBeCalledTimes(1);
        spyRmDir.mockRestore();
    });

    it('should throw an error if the directory does not exist', () => {
        const spyRmDir = jest.spyOn(fs, 'rm').mockImplementation(() => {
            throw new Error('test');
        });
        spyRmDir.mockClear();
        try {
            service.deleteDirectory('a');
        } catch (error) {
            expect(error.message).toEqual('test');
        }
        expect(spyRmDir).toBeCalledTimes(1);
        spyRmDir.mockRestore();
    });
});
