import { GameRecord } from '@app/model/database/game-record';
import { GameRecordService } from '@app/services/game-record/game-record.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameRecordController } from './game-record.constroller';

describe('GameRecordController', () => {
    let controller: GameRecordController;
    let gameRecordService: SinonStubbedInstance<GameRecordService>;
    let game: GameRecord;

    beforeEach(async () => {
        gameRecordService = createStubInstance(GameRecordService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameRecordController],
            providers: [
                {
                    provide: GameRecordService,
                    useValue: gameRecordService,
                },
            ],
        }).compile();
        controller = module.get<GameRecordController>(GameRecordController);
        game = {
          gameName: 'test',
          typeGame: 'test',
          time: 'test',
          playerName: 'test',
          dateStart: 'test'
        };
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    
    it('should create a game record and return 201 status code', async () => {
       gameRecordService.addGameRecord.resolves();
       const res = {} as unknown as Response;
       res.status = (code) => {
            expect(code).toBe(HttpStatus.NOT_FOUND);
            return res;
       }
      res.send = () => res;
      await controller.createGameRecord(game,res);
    });

    it('createGameRecord() should return NOT_FOUND when service add the game record', async () => {
        gameRecordService.addGameRecord.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        console.log(res);
        res.send = () => res;
        await controller.createGameRecord(game, res);
    });
});
