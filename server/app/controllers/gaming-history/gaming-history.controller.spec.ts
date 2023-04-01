import { GamingHistory } from '@app/model/database/gaming-history';
import { GameRecordService } from '@app/services/game-record/game-record.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GamingHistoryController } from './gaming-history.controller';

describe('GamingHistoryController', () => {
    let controller: GamingHistoryController;
    let gameRecordService: SinonStubbedInstance<GameRecordService>;
    let stubGamingHistory: GamingHistory;

    beforeEach(async () => {
        gameRecordService = createStubInstance(GameRecordService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GamingHistoryController],
            providers: [
                {
                    provide: GameRecordService,
                    useValue: gameRecordService,
                },
            ],
        }).compile();
        controller = module.get<GamingHistoryController>(GamingHistoryController);
        stubGamingHistory = {
            gameName: 'test',
            typeGame: 'test',
            time: 'test',
            playerName: 'test',
            dateStart: 'test',
        };
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });


});
