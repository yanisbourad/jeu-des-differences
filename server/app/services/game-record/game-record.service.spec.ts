import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

import { GameRecord, GameRecordDocument } from '@app/model/database/game-record';
import { GamingHistory, GamingHistoryDocument } from '@app/model/database/gaming-history';
import { GameService } from '@app/services/game/game.service';
import { Logger } from '@nestjs/common';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameRecordService } from './game-record.service';

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

    // it('should return all game records', async () => {
    //     const gameRecords = [
    //         {
    //             gameName: 'test',
    //             typeGame: 'test',
    //             time: '1:20',
    //             playerName: 'Mary',
    //             dateStart: '2023-03-15',
    //         },
    //     ];
    //     jest.spyOn(gameRecordModel, 'find').mockResolvedValue(gameRecords);
    //     expect(await service.getAllGameRecord()).toEqual(gameRecords);
    // });

    // it('should return empty array if no game records', async () => {
    //     jest.spyOn(gameRecordModel, 'find').mockResolvedValue([]);
    //     expect(await service.getAllGameRecord()).toEqual([]);
    // });

    // it('should return all gaming history', async () => {
    //     const gamingHistory = [
    //         {
    //             gameName: 'test',
    //             typeGame: 'test',
    //             time: '1:20',
    //             playerName: 'Mary',
    //             dateStart: '2023-03-15',
    //         },
    //     ];
    //     jest.spyOn(gamingHistoryModel, 'find').mockResolvedValue(gamingHistory); // mock the find method of the model
    //     expect(await service.getAllGamingHistory()).toEqual(gamingHistory);
    // });

    // it('should return empty array if no gaming history', async () => {
    //     jest.spyOn(gamingHistoryModel, 'find').mockResolvedValue([]);
    //     expect(await service.getAllGamingHistory()).toEqual([]);
    // });

    // describe('getAllGameRecord', () => {
    //     it('should return all game records', async () => {
    //         const gameRecords = [
    //             {
    //                 gameName: 'test',
    //                 typeGame: 'test',
    //                 time: '1:20',
    //                 playerName: 'Mary',
    //                 dateStart: '2023-03-15',
    //             },
    //         ];
    //         jest.spyOn(gameRecordModel, 'find').mockResolvedValue(gameRecords);
    //         expect(await service.getAllGameRecord()).toEqual(gameRecords);
    //     });

    //     it('should return empty array if no game records', async () => {
    //         jest.spyOn(gameRecordModel, 'find').mockResolvedValue([]);
    //         expect(await service.getAllGameRecord()).toEqual([]);
    //     });
    // });

    // describe('getAllGamingHistory', () => {
    //     it('should return all gaming history', async () => {
    //         const gamingHistory = [
    //             {
    //                 gameName: 'test',
    //                 typeGame: 'test',
    //                 time: '1:20',
    //                 playerName: 'Mary',
    //                 dateStart: '2023-03-15',
    //             },
    //         ];
    //         jest.spyOn(gamingHistoryModel, 'find').mockResolvedValue(gamingHistory); // mock the find method of the model
    //         expect(await service.getAllGamingHistory()).toEqual(gamingHistory);
    //     });

    //     it('should return empty array if no gaming history', async () => {
    //         jest.spyOn(gamingHistoryModel, 'find').mockResolvedValue([]);
    //         expect(await service.getAllGamingHistory()).toEqual([]);
    //     });
    // });

    // describe('createGameRecord', () => {
    //     it('should create a game record', async () => {
    //         const createGameRecordDto: CreateGameRecordDto = {
    // gameName: 'test',
    // typeGame: 'test',
    // time: '1:20',
    // playerName: 'Mary',
    // dateStart: '2023-03-15',
    //         };
    //         const gameRecord = {
    //             gameName: 'test',
    //             typeGame: 'test',
    //             time: '1:20',
    //             playerName: 'Mary',
    //             dateStart: '2023-03-15',
    //         };
    //         jest.spyOn(gameRecordModel, 'create').mockResolvedValue(gameRecord);
    //         expect(await service.createGameRecord(createGameRecordDto)).toEqual(gameRecord);
    //     });
    // });

    // describe('createGamingHistory', () => {
    //     it('should create a gaming history', async () => {
    //         const createGamingHistoryDto: CreateGamingHistoryDto = {
    //             gameName: 'test',

    //             gameType: 'test',
    //             gameMode: 'test',
    //             gameDuration: 1,
    //             gameResult: 'test',
    //             gameScore: 1,
    //             gameDate: new Date(),
    //         };
    //         const gamingHistory = {
    //             gameName: 'test',
    //             gameType: 'test',
    //             gameMode: 'test',
    //             gameDuration: 1,

    //             gameResult: 'test',
    //             gameScore: 1,
    //             gameDate: new Date(),
    //         };
    //         jest.spyOn(gamingHistoryModel, 'create').mockResolvedValue(gamingHistory);
    //         expect(await service.createGamingHistory(createGamingHistoryDto)).toEqual(gamingHistory);
    //     });
    // });

    // describe('deleteGameRecords', () => {
    //     it('should delete all game records', async () => {
    //         jest.spyOn(gameRecordModel, 'deleteMany').mockResolvedValue({ deletedCount: 1 });
    //         expect(await service.deleteGameRecords()).toEqual({ deletedCount: 1 });
    //     });
    // });

    // describe('deleteGamingHistory', () => {
    //     it('should delete all gaming history', async () => {
    //         jest.spyOn(gamingHistoryModel, 'deleteMany').mockResolvedValue({ deletedCount: 1 });
    //         expect(await service.deleteGamingHistory()).toEqual({ deletedCount: 1 });
    //     });
    // });

    // describe('deleteGameRecordsByGameName', () => {
    //     it('should delete all game records by game name', async () => {
    //         jest.spyOn(gameRecordModel, 'deleteMany').mockResolvedValue({ deletedCount: 1 });
    //         expect(await service.deleteGameRecordsByGameName('test')).toEqual({ deletedCount: 1 });
    //     });
    // });

    // describe('deleteGamingHistoryByGameName', () => {
    //     it('should delete all gaming history by game name', async () => {
    //         jest.spyOn(gamingHistoryModel, 'deleteMany').mockResolvedValue({ deletedCount: 1 });
    //         expect(await service.deleteGamingHistoryByGameName('test')).toEqual({ deletedCount: 1 });
    //     });
    // });

    // describe('deleteGameRecordsByGameType', () => {
    //     it('should delete all game records by game type', async () => {
    //         jest.spyOn(gameRecordModel, 'deleteMany').mockResolvedValue({ deletedCount: 1 });
    //         expect(await service.deleteGameRecordsByGameType('test')).toEqual({ deletedCount: 1 });
    //     });
    // });

    // describe('deleteGamingHistoryByGameType', () => {
    //     it('should delete all gaming history by game type', async () => {
    //         jest.spyOn(gamingHistoryModel, 'deleteMany').mockResolvedValue({ deletedCount: 1 });
    //         expect(await service.deleteGamingHistoryByGameType('test')).toEqual({ deletedCount: 1 });
    //     });
    // });

    // describe('deleteGameRecordsByGameMode', () => {
    //     it('should delete all game records by game mode', async () => {
    //         jest.spyOn(gameRecordModel, 'deleteMany').mockResolvedValue({ deletedCount: 1 });
    //         expect(await service.deleteGameRecordsByGameMode('test')).toEqual({ deletedCount: 1 });
    //     });
    // });
});
