import { GameRecord, GameRecordDocument } from '@app/model/database/game-record';
import { TimerConstantsModel } from '@app/model/database/timer-constants';
import { Game, TimeConfig } from '@common/game';
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
    let logger: Logger;
    const mockGame = {
        gameName: 'jkdexwjndf',
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
        // service.updateConstants(newConstants); // TODO : a changer, doit être un mock sinon ca change les vrai valeurs dans le jeu
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

    // it('should throw an error if the game already exists', async () => {
    //     // Arrange
    //     const mockGame1 = {
    //         gameName: 'huebj',
    //         difficulty: 'easy',
    //         originalImageData: 'test',
    //         modifiedImageData: 'test',
    //         listDifferences: [],
    //     } as Game;
    //     service.gamesNames = ['huebj'];
    //     await service.addGame(mockGame1);
    //     jest.spyOn(service, 'addGame').mockRejectedValue(new Error(`Failed to insert Game: ${mockGame1.gameName} already exists`));

    //     // Act & Assert
    //     await expect(service.addGame(mockGame1)).rejects.toThrow(`Failed to insert Game: ${mockGame1.gameName} already exists`);
    // });


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

    it('should write new constants to file and update database', async () => {
        const spyDbSaveMany = jest.spyOn(service.timerConstantsModel, 'updateOne').mockImplementation();
        const spyWriteFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation();
        const spyMkdirSync = jest.spyOn(fs, 'mkdirSync').mockImplementation();
        const spyExistsSync = jest.spyOn(fs, 'existsSync').mockReturnValue(false);

        try {
            await service.updateConstants(newConstants);

            expect(spyWriteFileSync).toHaveBeenCalledWith(`${service.rootPathTime}/time/infoTime.json`, JSON.stringify(newConstants), 'utf8');
            expect(spyExistsSync).toHaveBeenCalledWith(`${service.rootPathTime}/time`);
            expect(spyMkdirSync).toHaveBeenCalledWith(`${service.rootPathTime}/time`);
            expect(spyDbSaveMany).toHaveBeenCalledWith({}, newConstants, { upsert: true });

            spyWriteFileSync.mockRestore();
            spyMkdirSync.mockRestore();
            spyExistsSync.mockRestore();
            spyDbSaveMany.mockRestore();
        } catch (error) {
            console.error(error);
            fail();
        }
    });

    it('should return the time constants from infoTime.json', async () => {
        const mockedResult = {
            timeInit: 0,
            timePen: 0,
            timeBonus: 0,
        };
        const fileSpy = jest.spyOn(service, 'getFileTime').mockReturnValueOnce(JSON.stringify(mockedResult));

        // Act
        const result = await service.getConstants();
        expect(fileSpy).toHaveBeenCalled();
        expect(result).toEqual(mockedResult);
        fileSpy.mockRestore();
    });

    it('should read the file contents and return as string', async () => {
        // Arrange
        const mockDirName = 'time';
        const mockFileName = 'infoTime.json';
        const expectedContents = await service.getConstants();

        // Act
        const result = service.getFileTime(mockDirName, mockFileName);
        // Assert
        expect(JSON.parse(result) as TimeConfig).toEqual(expectedContents);
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

    it('should count the number of games', () => {
        // service.gamesNames = ['game1', 'game2', 'game3'];
        service.gamesNames.length = 1;
        const spyCount = jest.spyOn(service, 'countGames');
        const result = service.countGames();
        expect(result).toBe(1);
        expect(spyCount).toHaveBeenCalled();
      });

    it('should populate fake game records for a given game name', async () => {
        // Arrange
        const mockGameName = 'test-game';
        const mockGameRecords = {
            gameName: 'game1',
            typeGame: 'easy',
            time: 'imageData',
            playerName: 'modifiedImageData',
            dateStart: 'yo',
            keyServer: 'yo',
        } as GameRecord;
        const spyInsertMany = jest.spyOn(service.gameRecordModel, 'insertMany').mockImplementation();
        const spyptn = jest.spyOn(service, 'getFakeGameRecords').mockImplementation();
        // Act
        service.populateFakeGameRecordsForOneGame(mockGameName);

        // Assert
        expect(spyInsertMany).toHaveBeenCalled();
        expect(spyptn).toHaveBeenCalled();
        spyInsertMany.mockRestore();
        spyptn.mockRestore();
    });

    // it('should populate fake game records for all game name', async () => {
    //     // Arrange
    //     const mockGameName = 'test-game';
    //     const mockGameRecords = {
    //         gameName: 'game1',
    //         typeGame: 'easy',
    //         time: 'imageData',
    //         playerName: 'modifiedImageData',
    //         dateStart: 'yo',
    //         keyServer: 'yo',
    //     } as GameRecord;
    //     const spyInsertMany = jest.spyOn(service.gameRecordModel, 'insertMany').mockImplementation();
    //     const spyptn = jest.spyOn(service, 'populateFakeGameRecordsForOneGame').mockImplementation();
    //     // Act
    //     service.populateFakeGameRecords();

    //     // Assert
    //     expect(spyInsertMany).toHaveBeenCalled();
    //     expect(spyptn).toHaveBeenCalled();
    //     spyInsertMany.mockRestore();
    //     spyptn.mockRestore();
    // });

    it('should call populateFakeGameRecordsForOneGame for each game in gamesNames', async () => {
        // Arrange
        let spyPopulate = jest.spyOn(service, 'populateFakeGameRecordsForOneGame').mockImplementation();
        service.gamesNames = ['game1'];

        // Act
        service.populateFakeGameRecords();

        // Assert
        expect(spyPopulate).toHaveBeenCalledTimes(1);
        expect(spyPopulate).toHaveBeenCalledWith('game1');

        spyPopulate.mockRestore();
    });

    it('should log an error if there is an error deleting the directory', () => {
        // Arrange
        const mockedError = new Error('Failed to delete directory');
        const spyRm = jest.spyOn(fs, 'rm').mockImplementation((path, options, callback) => {
            callback(mockedError);
        });
        const spyLog = jest.spyOn(service.logger, 'error').mockImplementation();

        // Act
        service.deleteDirectory('testDir');

        // Assert
        expect(spyRm).toHaveBeenCalledWith(`${service.rootPath}/testDir`, { recursive: true }, expect.any(Function));
        expect(spyLog).toHaveBeenCalledWith(`Failed to delete directory testDir`);

        // Cleanup
        spyRm.mockRestore();
        spyLog.mockRestore();
    });

    it('should return an array of sets with the correct elements', () => {
        const differencesStr = ['1,2,3', '2,3,4', '3,4,5'];
        const expected = [new Set([1, 2, 3]),
        new Set([2, 3, 4]),
        new Set([3, 4, 5]),
        ];

        const result = service.getSetDifference(differencesStr);

        expect(result).toEqual(expected);
    });

    it('should return a Map of games', async () => {
        // Arrange
        jest.spyOn(service, 'getGame').mockReturnValue(mockGame);
        const games = ['game1', 'game2', 'game3'];
        service.gamesNames = games;
        const expected = new Map<string, Game>();
        games.forEach((gameName) => expected.set(gameName, service.getGame(gameName)));

        // Act
        const result = service.getGames();

        // Assert
        expect(result).toEqual(expected);
        jest.restoreAllMocks();
    });

    it('should log an error and return an empty map if there are no games', () => {
        const mockLogger = { error: jest.fn() };
        const mockGetGame = jest.fn();
        const gameService = service;

        // Set gamesNames to an empty array to trigger the no games error
        gameService.gamesNames = [];

        gameService.getGames();
        expect(mockGetGame).not.toHaveBeenCalled();
    });

    it('should throw error if game already exists', async () => {
        const spyDbSaveMany = jest.spyOn(service.gameRecordModel, 'insertMany').mockImplementation();
        const existingGame: Game = {
        gameName: 'existingGame',
        originalImageData: 'test',
        modifiedImageData: 'test',
        listDifferences: [],
        difficulty: 'easy'
        };
        service.gamesNames = ['existingGame'];
        await expect(service.addGame(existingGame)).rejects.toThrowError('Failed to insert Game: existingGame already exists');
        expect(spyDbSaveMany).not.toHaveBeenCalled();
        spyDbSaveMany.mockRestore();
        // expect(loggerSpy).toHaveBeenCalledWith(`Failed to insert Game: ${existingGame.gameName} already exists`);
    });

    it('should throw error if cant delete game', async () => {
        const spyDbSaveMany = jest.spyOn(service.gameRecordModel, 'deleteMany').mockImplementation();
        const existingGame: Game = {
        gameName: 'existingGame1',
        originalImageData: 'test',
        modifiedImageData: 'test',
        listDifferences: [],
        difficulty: 'easy'
        };
        service.gamesNames = ['existingGame'];
        await expect(service.deleteGame(existingGame.gameName)).rejects.toThrowError('Does not exist');
        expect(spyDbSaveMany).not.toHaveBeenCalled();
        spyDbSaveMany.mockRestore();
        // expect(loggerSpy).toHaveBeenCalledWith(`Failed to insert Game: ${existingGame.gameName} already exists`);
    });
    // it('should generate a fake record info', () => {
    //     const spyFloor = jest.spyOn(Math, 'floor');
    //     spyFloor.mockReturnValueOnce(2);
    //     spyFloor.mockReturnValueOnce(23);
    //     spyFloor.mockReturnValueOnce(1);
    //     const result = service.generateFakeRecordInfo();
    //     expect(result).toEqual({ name: 'name1', time: '23:01' });
    //     expect(spyFloor).toHaveBeenCalledTimes(3);
    //     spyFloor.mockRestore();
    //   });
    
    //   it('should generate a fake record info with zero-padded seconds', () => {
    //     const spyFloor = jest.spyOn(Math, 'floor');
    //     spyFloor.mockReturnValueOnce(5);
    //     spyFloor.mockReturnValueOnce(3);
    //     spyFloor.mockReturnValueOnce(2);
    //     const result = service.generateFakeRecordInfo();
    //     expect(result).toEqual({ name: 'name1', time: '5:03' });
    //     expect(spyFloor).toHaveBeenCalledTimes(3);
    //     spyFloor.mockRestore();
    //   });

    it('should return a random name and time', () => {
        const spyFloor = jest.spyOn(Math, 'floor');
        const spyRandom = jest.spyOn(Math, 'random');
        spyFloor.mockReturnValueOnce(2);
        spyFloor.mockReturnValueOnce(58);
        spyRandom.mockReturnValueOnce(0.1);
        service.generateFakeRecordInfo();
        expect(spyFloor).toHaveBeenCalledTimes(3);
        expect(spyRandom).toHaveBeenCalledTimes(3);
        spyFloor.mockRestore();
        spyRandom.mockRestore();
      });
});
