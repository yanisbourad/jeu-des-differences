import { GamingHistory } from '@app/model/database/gaming-history';
import { GameRecordService } from '@app/services/game-record/game-record.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
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

    // test for allGames()
    it('should return all gaming History', async () => {
        jest.spyOn(gameRecordService, 'getAllGamingHistory').mockImplementation(async () => {
            return Promise.resolve([stubGamingHistory]);
        });
        const res = {} as unknown as Response;
        res.json = (body) => {
            expect(body).toStrictEqual([stubGamingHistory]);
            return res;
        };
        res.status = (code) => {
            expect(code).toBe(HttpStatus.OK);
            return res;
        };
        await controller.allGames(res);
        expect(gameRecordService.getAllGamingHistory).toHaveBeenCalled();
    });

    it('should return NOT_FOUND http status when request fails', async () => {
        jest.spyOn(gameRecordService, 'getAllGamingHistory').mockRejectedValueOnce(new Error('test error'));
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toBe(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = (message) => {
            expect(message).toBe('test error');
            return res;
        };
        res.send = () => res;
        await controller.allGames(res);
        expect(gameRecordService.getAllGamingHistory).toHaveBeenCalled();
    });


});
