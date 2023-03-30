// tests for the game-record service

// import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
// import { Model } from 'mongoose';

// import { GameRecord, GameRecordDocument } from '@app/model/database/game-record';
// import { CreateGameRecordDto } from '@app/model/dto/game-record/create-game-record.dto';
import { GameService } from '@app/services/game/game.service';
// import { Logger } from '@nestjs/common';
// import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameRecord, GameRecordDocument } from '@app/model/database/game-record';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SinonStubbedInstance } from 'sinon';
import { GameRecordService } from './game-record.service';

describe('GameRecordService', () => {
    let service: GameRecordService;
    let logger: SinonStubbedInstance<Logger>;
    let gameService: SinonStubbedInstance<GameService>;
    let gameRecordModel: Model<GameRecordDocument>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameRecordService,
                {
                    provide: getModelToken('GameRecord'),
                    useValue: {
                        find: jest.fn().mockReturnThis(),
                        exec: jest.fn().mockResolvedValue([]),
                        create: jest.fn().mockResolvedValue({}),
                    },
                },

                {
                    provide: GameService,
                    useValue: gameService,
                },
                {
                    provide: Logger,
                    useValue: logger,
                },
            ],
        }).compile();
        gameRecordModel = module.get<Model<GameRecordDocument>>(getModelToken(GameRecord.name));

        service = module.get<GameRecordService>(GameRecordService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

// describe('GameRecordService', () => {
//     let service: GameRecordService;
//     let gameRecordModel: Model<GameRecordDocument>;
//     let gameService: SinonStubbedInstance<GameService>;
//     let logger: SinonStubbedInstance<Logger>;

//     beforeEach(async () => {
//         gameService = createStubInstance<GameService>(GameService);
//         const module: TestingModule = await Test.createTestingModule({
//             providers: [
//                 GameRecordService,
//                 GameService,
//                 {
//                     provide: getModelToken(GameRecord.name),
//                     useValue: {
//                         find: jest.fn().mockReturnThis(),
//                         exec: jest.fn().mockResolvedValue([]),
//                         create: jest.fn().mockResolvedValue({}),
//                     },
//                 },
//                 {
//                     provide: Logger,
//                     useValue: logger,
//                 },
//             ],
//         }).compile();

//         service = module.get<GameRecordService>(GameRecordService);
//         gameRecordModel = module.get<Model<GameRecordDocument>>(getModelToken(GameRecord.name));
//     });

//     it('should be defined', () => {
//         expect(service).toBeDefined();
//     });

//     describe('getAllGameRecord', () => {
//         it('should return an array of game records', async () => {
//             const result = await service.getAllGameRecord();
//             expect(result).toEqual([]);
//         });
//     });

//     describe('addGameRecord', () => {
//         it('should return an array of game records', async () => {
//             const record: CreateGameRecordDto = {
//                 gameName: 'test',
//                 typeGame: 'solo',
//                 time: '00:00:00',
//                 playerName: 'test',
//                 dateStart: '2020-01-01',
//             };
//             await service.addGameRecord(record);
//             expect(gameRecordModel.create).toBeCalledWith({
//                 gameName: 'test' + gameService.getKey,
//                 gameType: 'test',
//                 gameDate: new Date(),
//                 gameScore: 0,
//                 gameDuration: 0,
//             });
//         });
//     });
// });
