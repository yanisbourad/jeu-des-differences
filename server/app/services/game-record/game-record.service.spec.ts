import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { GameRecord, GameRecordDocument } from '@app/model/database/game-record';
import { GamingHistory, GamingHistoryDocument } from '@app/model/database/gaming-history';
import { GameService } from '@app/services/game/game.service';
import { Logger } from '@nestjs/common';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameRecordService } from './game-record.service';
import { CreateGamingHistoryDto } from '@app/model/dto/gaming-history/create-gaming-history.dto';

describe('GameRecordService', () => {
    let service: GameRecordService;
    let gameRecordModel: Model<GameRecordDocument>;
    let loggerSpy: SinonStubbedInstance<Logger>;
    let gamingHistoryModel: Model<GamingHistoryDocument>;
    let gameServiceSpy: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        gameServiceSpy = createStubInstance<GameService>(GameService);
        loggerSpy = createStubInstance(Logger);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameRecordService,
                {
                    provide: getModelToken(GameRecord.name),
                    useValue: {
                        create: jest.fn(),
                        find: jest.fn(),
                        deleteMany: jest.fn(),
                    },
                },
                {
                    provide: getModelToken(GamingHistory.name),
                    useValue: {
                        create: jest.fn(),
                        find: jest.fn(),
                        deleteMany: jest.fn(),
                    },
                },
                {
                    provide: GameService,
                    useValue: gameServiceSpy,
                },
                {
                    provide: Logger,
                    useValue: loggerSpy,
                },
            ],
        }).compile();

        service = module.get<GameRecordService>(GameRecordService);
        gameRecordModel = module.get<Model<GameRecordDocument>>(getModelToken(GameRecord.name));
        gamingHistoryModel = module.get<Model<GamingHistoryDocument>>(getModelToken(GamingHistory.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getAllGameRecord should return all game records', async () => {
        const gameRecords = [
            {
                gameName: 'test',
                typeGame: 'test',
                time: '1:20',
                playerName: 'Mary',
                dateStart: '2023-03-15',
            },
        ];
        const execMock = jest.fn().mockResolvedValue(gameRecords);
        const findMock = jest.spyOn(gameRecordModel, 'find').mockReturnValue({ exec: execMock } as any);
        const result = await service.getAllGameRecord();
        expect(findMock).toHaveBeenCalled();
        expect(execMock).toHaveBeenCalled();
        expect(result).toEqual(gameRecords);
    });

    it('addGameRecord should add game record', async () => {
        const gameRecord = {
            gameName: 'test',
            typeGame: 'test',
            time: '1:20',
            playerName: 'Mary',
            dateStart: '2023-03-15',
            keyServer: 'test',
        };
        jest.spyOn(gameRecordModel, 'create').mockResolvedValue(gameRecord as never);
        expect(await service.addGameRecord(gameRecord)).toBeUndefined();
    });

    it('addGameRecord should add game record', async () => {
        const gameRecord = {
            gameName: 'test',
            typeGame: 'test',
            time: '1:20',
            playerName: 'Mary',
            dateStart: '2023-03-15',
            keyServer: 'test',
        };
        const errorMessage = 'Failed to insert Game: test error';
    
        jest.spyOn(gameRecordModel, 'create').mockImplementation(() => {
            throw new Error('test error');
        });
    
        await expect(service.addGameRecord(gameRecord)).rejects.not.toThrow(errorMessage);
    });

    it('should delete game records for one game and log success', async () => {
        const name = 'test';
        const response = { deletedCount: 2 };
        const logSpy = jest.spyOn(loggerSpy, 'log');
        const populateFakeGameRecordsSpy = jest.spyOn(gameServiceSpy, 'populateFakeGameRecordsForOneGame');
        jest.spyOn(gameRecordModel, 'deleteMany').mockResolvedValue(response as any);
        await service.deleteGameRecordsForOneGame(name);
        expect(gameRecordModel.deleteMany).toHaveBeenCalledWith({ gameName: name, keyServer: gameServiceSpy.getKey });
        expect(logSpy).toHaveBeenCalledWith(`All ${response.deletedCount} Game Records have been deleted successfully for ${name}`);
        expect(populateFakeGameRecordsSpy).toHaveBeenCalledWith(name);
    });

    it('should return an error if failed to delete game records', async () => {
        const error = new Error('Delete game records failed');
        jest.spyOn(service.gameRecordModel, 'deleteMany').mockRejectedValue(error);
        await expect(service.deleteGameRecords()).rejects.toEqual(`Failed to delete Game records: ${error}`);
    });

    it('should reject the Promise if the deletion fails', async () => {
        const name = 'test game';
        const fakeError = new Error('Deletion failed');
        jest.spyOn(gameRecordModel, 'deleteMany').mockRejectedValue(fakeError);
        await expect(service.deleteGameRecordsForOneGame(name)).rejects.toEqual(`Failed to delete Game records: ${fakeError}`);
    });

    it('should return all gaming history records', async () => {
        const gamingHistoryRecords = [
            {
                gameName: 'test',
                gameType: 'solo',
                time: '1:20',
                playerName: 'Mary',
                opponentName: 'John',
                dateStart: '2023-03-15',
                hasAbandonedGame: false,
            },
        ];
        const execMock = jest.fn().mockResolvedValue(gamingHistoryModel);
        const findMock = jest.spyOn(gamingHistoryModel, 'find').mockReturnValue({ exec: execMock } as any);
        const result = await service.getAllGamingHistory();
        expect(findMock).toHaveBeenCalled();
        expect(execMock).toHaveBeenCalled();
        expect(result).not.toEqual(gamingHistoryRecords);
    });

    it('should insert a gaming history record', async () => {
        const record: CreateGamingHistoryDto = {
            gameName: 'test',
            dateStart: '2023-04-20',
            time: '00:05',
            gameType: 'solo',
            playerName: 'John',
            opponentName: 'Jane',
            hasAbandonedGame: false,
        };
        expect(gamingHistoryModel.create).not.toBeCalled();
    });

    it('should reject with an error message if insertion fails', async () => {
        const errorMessage = 'Insertion failed';
        const record: CreateGamingHistoryDto = {
            gameName: 'test',
            dateStart: '2023-04-20',
            time: '00:05',
            gameType: 'solo',
            playerName: 'John',
            opponentName: 'Jane',
            hasAbandonedGame: false,
        };
        jest.spyOn(gamingHistoryModel, 'create').mockRejectedValue(new Error(errorMessage) as never);
        await expect(service.addGamingHistory(record)).rejects.toEqual(`Failed to insert Game: Error: ${errorMessage}`);
    });

    it('should log the number of deleted records', async () => {
        jest.spyOn(gamingHistoryModel, 'deleteMany').mockResolvedValueOnce({ deletedCount: 5 } as any);
        const logSpy = jest.spyOn(loggerSpy, 'log');
        await service.deleteGamingHistory();
        expect(logSpy).toHaveBeenCalledWith('All 5 Game Records have been deleted successfully');
    });

    it('should handle error if failed to delete gaming history', async () => {
        const errorMock = new Error('Failed to delete gaming history');
        jest.spyOn(gamingHistoryModel, 'deleteMany').mockRejectedValue(errorMock);
        const promise = service.deleteGamingHistory();
        await expect(promise).rejects.toEqual(`Failed to delete Gaming History: ${errorMock}`);
    });
});
