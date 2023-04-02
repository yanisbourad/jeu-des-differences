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
            dateStart: 'test',
            time: 'test',
            gameType: 'test',
            playerName: 'test',
            opponentName: 'test',
        };
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
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
    it('should create a gaming history', async () => {
        jest.spyOn(gameRecordService, 'addGamingHistory').mockImplementation(async () => Promise.resolve());
        const res = {} as unknown as Response;
        res.status = () => {
            return res;
        };
        res.json = (message) => {
            expect(message).toEqual(res);
            return res;
        };
        res.send = () => res;
        await controller.createGamingHistory(stubGamingHistory, res);
        expect(gameRecordService.addGamingHistory).toHaveBeenCalled();
    });
    it('should not create a gaming history and return 409 status code', async () => {
        jest.spyOn(gameRecordService, 'addGamingHistory').mockImplementation(() => {
            throw new Error('test error');
        });
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toBe(HttpStatus.CONFLICT);
            return res;
        };
        res.json = (message) => {
            expect(message).toEqual('test error');
            return res;
        };
        res.send = () => res;
        await controller.createGamingHistory(stubGamingHistory, res);
        expect(gameRecordService.addGamingHistory).toHaveBeenCalled();
    });
    it('Should delete games and  return OK ', async () => {
        jest.spyOn(gameRecordService, 'deleteGameRecords').mockResolvedValueOnce();

        const res = {} as unknown as Response;
        res.status = () => {
            return res;
        };
        res.json = (message) => {
            expect(message).toEqual('Game deleted successfully');
            return res;
        };
        await controller.deleteGame(res);
        expect(gameRecordService.deleteGameRecords).toHaveBeenCalled();
    });
    it('Should return NO_CONTENT when nothing is deleted', async () => {
        jest.spyOn(gameRecordService, 'deleteGameRecords').mockImplementation(async () => Promise.reject(new Error('test error')));
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.send = (message) => {
            expect(message).toEqual('test error');
            return res;
        };
        res.send = () => res;
        await controller.deleteGame(res);
        expect(gameRecordService.deleteGameRecords).toHaveBeenCalled();
    });
});
