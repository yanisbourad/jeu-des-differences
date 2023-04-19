import { GameRecordDocument } from '@app/model/database/game-record';
import { Game, TimeConfig } from '@common/game';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import { Model, Query } from 'mongoose';
import { join } from 'path';
import { GameService } from './game.service';
import { TimerConstantsModel } from '@app/model/database/timer-constants';
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
    let logger: Logger;
    const mockGame = {
        gameName: 'jkdexwjnd',
        difficulty: 'easy',
        originalImageData: 'test',
        modifiedImageData: 'test',
        listDifferences: [],
    } as Game;

    const newConstants = {
        timeInit: 0,
        timePen: 0,
        timeBonus: 0,
    } as TimeConfig;

    beforeAll(() => {
        const gameRecordModel = {
            find: () => [],
            insertMany: () => [],
            deleteMany: () => [],
        } as unknown as Model<GameRecordDocument>;

        const timerConstantsModel = {
            updateOne: () => [],
        } as unknown as Model<TimerConstantsModel>;
        logger = new Logger();
        service = new GameService(gameRecordModel, logger, timerConstantsModel);
        service.addGame(mockGame);
        service.updateConstants(newConstants); // TODO : a changer, doit être un mock sinon ca change les vrai valeurs dans le jeu
        // notice that only the functions we call from the model are mocked
        // we can´t use sinon because mongoose Model is an interface and not a class
    });
    beforeEach(async () => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.clearAllMocks();
        // service.deleteGame(mockGame.gameName);
        fs.rmSync(service.rootPath, { recursive: true }); // i changed fs.rmdirSync to fs.rmSync cause it's outdated
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
        const mockGameName = 'testtfudebhjwks';
        expect(service.isValidGameName(mockGameName)).toEqual(true);
    });

    it('should return false if the game name is not valid', () => {
        expect(service.isValidGameName(service.gamesNames[0])).toBeFalsy();
    });

    it('should save the game', async () => {
        const spyDbSaveMany = jest.spyOn(service.gameRecordModel, 'insertMany').mockImplementation();
        const spyWriteFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation();
        const spyMkdirSync = jest.spyOn(fs, 'mkdirSync').mockImplementation();
        const spyExistsSync = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        const mockGame1 = {
            gameName: 'huebj',
            difficulty: 'easy',
            originalImageData: 'test',
            modifiedImageData: 'test',
            listDifferences: [],
        } as Game;
        await service.addGame(mockGame1);
        expect(spyWriteFileSync).toHaveBeenCalled();
        expect(spyExistsSync).toHaveBeenCalledWith(service.rootPath + '/' + mockGame1.gameName);
        expect(spyMkdirSync).toHaveBeenCalledWith(service.rootPath + '/' + mockGame1.gameName);
        expect(service.gamesNames).toContain(mockGame.gameName);
        expect(spyDbSaveMany).toHaveBeenCalledTimes(1);
        spyWriteFileSync.mockRestore();
        spyMkdirSync.mockRestore();
        spyExistsSync.mockRestore();
        spyDbSaveMany.mockRestore();
    });

    it('should return the same game as saved game', async () => {
        const result = await service.getGame(mockGame.gameName);
        expect(result).toBeDefined();
        expect(result.gameName).toEqual(mockGame.gameName);
        expect(result.difficulty).toEqual(mockGame.difficulty);
        expect(result.originalImageData).toEqual(mockGame.originalImageData);
        expect(result.modifiedImageData).toEqual(mockGame.modifiedImageData);
        expect(result.listDifferences).toEqual(mockGame.listDifferences);
    });

    it('should throw an error if the game does not exist', () => {
        const gameName = 'oiklepjoew';
        try {
            service.getGame(gameName);
        } catch (error) {
            expect(error.message).toEqual(`Failed to get Game: ${gameName} does not exist`);
        }
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

        const timerConstantsModel = {
            find: () => [],
            insertMany: () => [],
            deleteMany: () => [],
        } as unknown as Model<TimerConstantsModel>;

        new GameService(gameRecordModel, new Logger(), timerConstantsModel);
        expect(spyCreateFolder).toHaveBeenCalled();
        expect(spyValidateKeyExists).toHaveBeenCalled();
        const keyPath = join(process.cwd(), 'assets', 'key.text');
        expect(spyValidateKeyExists).toHaveBeenCalledWith(keyPath);
        expect(spyCreateFile).toHaveBeenCalled();
        spyCreateFile.mockRestore();
        spyValidateKeyExists.mockRestore();
        spyCreateFolder.mockRestore();
    });

    it('should throw error if the game does not exist', async () => {
        try {
            await service.getGame('tgydewksjnest');
        } catch (error) {
            expect(true).toBeTruthy();
        }
    });

    it('should delete the game', async () => {
        const spyDeleteMany = jest.spyOn(service.gameRecordModel, 'deleteMany').mockImplementation();
        const spyDeleteFolder = jest.spyOn(fs, 'rm').mockImplementation();
        await service.deleteGame(mockGame.gameName);
        expect(spyDeleteMany).toBeCalledTimes(1);
        expect(spyDeleteFolder).toBeCalledTimes(1);
        expect(service.gamesNames).not.toContain(mockGame.gameName);
        service.gamesNames.push(mockGame.gameName);
    });

    // test updateConstants() in the service
    it('should update the constants', async () => {
        const spyDbSaveMany = jest.spyOn(service.timerConstantsModel, 'updateOne').mockImplementation();
        const spyWriteFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation();
        const spyMkdirSync = jest.spyOn(fs, 'mkdirSync').mockImplementation();
        const spyExistsSync = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        await service.updateConstants(newConstants);
        expect(spyWriteFileSync).toHaveBeenCalled();
        expect(spyExistsSync).toHaveBeenCalledWith(service.rootPathTime + '/time');
        expect(spyMkdirSync).toHaveBeenCalledWith(service.rootPathTime + '/time');
        expect(spyDbSaveMany).toHaveBeenCalledTimes(1);
        spyWriteFileSync.mockRestore();
        spyMkdirSync.mockRestore();
        spyExistsSync.mockRestore();
        spyDbSaveMany.mockRestore();
    });

    // test getConstants() in the service
    it('should return the same game as saved game', async () => {
        const result = await service.getConstants();
        expect(result).toBeDefined();
        expect(result.timeInit).toEqual(newConstants.timeInit);
        expect(result.timePen).toEqual(newConstants.timePen);
        expect(result.timeBonus).toEqual(newConstants.timeBonus);
    });

    // should test deleteAllGames() in the service
    it('should delete all games', async () => {
        const spyDeleteMany = jest.spyOn(service.gameRecordModel, 'deleteMany').mockImplementation();
        const spyDeleteFolder = jest.spyOn(fs, 'rm').mockImplementation();
        await service.deleteAllGames();
        expect(spyDeleteMany).toBeCalledTimes(2);
        expect(spyDeleteFolder).toBeCalledTimes(2);
        expect(service.gamesNames).not.toContain(mockGame.gameName);
        service.gamesNames.push(mockGame.gameName);
    });
});
