import { AppModule } from '@app/app.module';
import { GameService } from '@app/services/game/game.service';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import * as request from 'supertest';
import { GameController } from './game.controller';
describe('GameController', () => {
    let app: INestApplication;
    let gameService: GameService;
    let controller: GameController;
    let service: GameService;

    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        gameService = moduleRef.get<GameService>(GameService);
        app = moduleRef.createNestApplication();
        controller = moduleRef.get<GameController>(GameController);
        service = moduleRef.get<GameService>(GameService);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /game', () => {
        it('should return all games', async () => {
            const spy = jest.spyOn(gameService, 'getAllGames').mockResolvedValueOnce([
                {
                    gameName: 'game1',
                    difficulty: 'easy',
                    originalImageData: 'imageData',
                    modifiedImageData: 'modifiedImageData',
                    listDifferences: ['diff1', 'diff2'],
                    rankingMulti: [],
                    rankingSolo: [],
                },
            ]);

            const res = await request(app.getHttpServer()).get('/game');

            expect(spy).toHaveBeenCalled();
            expect(res.status).toBe(HttpStatus.OK);
            expect(res.body).toEqual([
                {
                    gameName: 'game1',
                    difficulty: 'easy',
                    originalImageData: 'imageData',
                    modifiedImageData: 'modifiedImageData',
                    listDifferences: ['diff1', 'diff2'],
                    rankingMulti: [],
                    rankingSolo: [],
                },
            ]);
        });

        it('should return NOT_FOUND http status when request fails', async () => {
            const spy = jest.spyOn(gameService, 'getAllGames').mockRejectedValueOnce(new Error('test error'));

            const res = await request(app.getHttpServer()).get('/game');

            expect(spy).toHaveBeenCalled();
            expect(res.status).toBe(HttpStatus.NOT_FOUND);
            expect(res.text).toEqual('test error');
        });
    });

    describe('GET /game/:id', () => {
        it('should return a game with a specific id', async () => {
            const spy = jest.spyOn(gameService, 'getGame').mockReturnValueOnce({
                gameName: 'game1',
                difficulty: 'easy',
                originalImageData: 'imageData',
                modifiedImageData: 'modifiedImageData',
                listDifferences: ['diff1', 'diff2'],
            });

            const res = await request(app.getHttpServer()).get('/game/game1');

            expect(spy).toHaveBeenCalledWith('game1');
            expect(res.status).toBe(HttpStatus.OK);
            expect(res.body).toEqual({
                gameName: 'game1',
                difficulty: 'easy',
                originalImageData: 'imageData',
                modifiedImageData: 'modifiedImageData',
                listDifferences: ['diff1', 'diff2'],
            });
        });
        it('should return error message', async () => {
            const spy = jest.spyOn(gameService, 'getGame').mockReturnValueOnce({
                gameName: 'game2',
                difficulty: 'easy',
                originalImageData: 'imageData',
                modifiedImageData: 'modifiedImageData',
                listDifferences: ['diff1', 'diff2'],
            });

            const res = await request(app.getHttpServer()).get('/game/game1');

            expect(spy).toHaveBeenCalledWith('game1');
            expect(res.status).toBe(HttpStatus.OK);
        });
    });
    describe('createGame', () => {
        it('createGame() should return NOT_FOUND when service add the course', async () => {
            const spy = jest.spyOn(gameService, 'addGame').mockImplementation();
            const game = {
                gameName: 'kasspopobnmkieieio',
                difficulty: 'easy',
                originalImageData: 'imageData',
                modifiedImageData: 'modifiedImageData',
                listDifferences: ['diff1', 'diff2'],
            };
            gameService.addGame(game);
            const res = {} as unknown as Response;
            res.status = (code) => {
                expect(code).toEqual(HttpStatus.NOT_FOUND);
                return res;
            };
            res.send = () => res;
            expect(spy).toBeCalled();
            await controller.createGame(game, res);
        });
    });
});
