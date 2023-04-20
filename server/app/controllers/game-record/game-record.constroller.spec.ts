import { GameRecord } from '@app/model/database/game-record';
import { GameRecordService } from '@app/services/game-record/game-record.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameRecordController } from './game-record.constroller';

describe('GameRecordController', () => {
    let controller: GameRecordController;
    let gameRecordService: SinonStubbedInstance<GameRecordService>;
    let game: GameRecord;
    let stubGameRecord: GameRecord;
    beforeEach(async () => {
        gameRecordService = createStubInstance(GameRecordService, {
            getAllGameRecord: Promise.resolve([stubGameRecord as GameRecord]),
          });
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
            dateStart: 'test',
            keyServer: 'test',
        };
        stubGameRecord = {
            gameName: 'game1',
            typeGame: 'easy',
            time: 'imageData',
            playerName: 'modifiedImageData',
            dateStart: 'yo',
            keyServer: 'yo',
        } as GameRecord;
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
        };
        res.send = () => res;
        await controller.createGameRecord(game, res);
    });

    it('createGameRecord() should return NOT_FOUND when service add the game record', async () => {
        gameRecordService.addGameRecord.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        await controller.createGameRecord(game, res);
    });
    it('should return all games', async () => {
        
        // jest.spyOn(controller, 'allGames').mockResolvedValue(Promise.resolve<void>(stubGameRecord));
        const res = {} as unknown as Response;
        res.json = (body) => {
            expect(body).toStrictEqual([stubGameRecord]);
            return res;
        };
        res.status = (code) => {
            expect(code).toBe(HttpStatus.OK);
            return res;
        };

        await controller.allGames(res);
    });

    it('should return NOT_FOUND http status when request fails', async () => {
        // jest.spyOn(gameService, 'getAllGames').mockRejectedValueOnce(new Error('test error'));
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
    });
    it('it should call function deleteAllGames from service', async () => {
        const spy = jest.spyOn(gameRecordService, 'deleteGameRecords').mockImplementation();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.json = (message) => {
            expect(message).toEqual('Games deleted successfully');
            return res;
        };
        res.send = () => res;
        await controller.deleteAllGameRecords(res);
        expect(spy).toBeCalled();
    });

    it('it should return BAD_REQUEST when service delete the Game', async () => {
        const spy = jest.spyOn(gameRecordService, 'deleteGameRecords').mockImplementation(() => {
            throw new Error('test error');
        });
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.send = (message) => {
            expect(message).toEqual('test error');
            return res;
        };
        await controller.deleteAllGameRecords(res);
        expect(spy).toBeCalled();
    });

    it('it should call function deleteGame from service', async () => {
        const spy = jest.spyOn(gameRecordService, 'deleteGameRecordsForOneGame').mockImplementation();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.json = (message) => {
            expect(message).toEqual('Game deleted successfully');
            return res;
        };
        res.send = () => res;
        await controller.deleteSpecificGameRecords('game1', res);

        expect(spy).toBeCalled();
    });

    it('it should return BAD_REQUEST when service delete the Game', async () => {
        const spy = jest.spyOn(gameRecordService, 'deleteGameRecordsForOneGame').mockImplementation(() => {
            throw new Error('test error');
        });
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.send = (message) => {
            expect(message).toEqual('test error');
            return res;
        };
        await controller.deleteSpecificGameRecords('game1', res);
        expect(spy).toBeCalled();
    });
});

