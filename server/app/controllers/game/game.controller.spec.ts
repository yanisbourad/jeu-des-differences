import { GameService } from '@app/services/game/game.service';
import { Game, GameInfo } from '@common/game';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameController } from './game.controller';

describe('GameController', () => {
    let gameService: SinonStubbedInstance<GameService>;
    let controller: GameController;
    let stubGame: Game;
    let stubGameInfo: GameInfo;
    beforeEach(async () => {
        gameService = createStubInstance(GameService, { getAllGames: Promise.resolve([stubGame as GameInfo]) });
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                {
                    provide: GameService,
                    useValue: gameService,
                },
            ],
        }).compile();
        controller = module.get<GameController>(GameController);
        stubGame = {
            gameName: 'game1',
            difficulty: 'easy',
            originalImageData: 'imageData',
            modifiedImageData: 'modifiedImageData',
            listDifferences: ['diff1', 'diff2'],
        };
        stubGameInfo = {
            gameName: 'game1',
            difficulty: 'easy',
            originalImageData: 'imageData',
            modifiedImageData: 'modifiedImageData',
            listDifferences: ['diff1', 'diff2'],
        } as GameInfo;
        // controller = moduleRef.get<GameController>(GameController);
        // service = moduleRef.get<GameService>(GameService);
    });

    describe('GET /game', () => {
        it('should return all games', async () => {
            // gameService.getAllGames//returns(Promise.resolve([stubGame as GameInfo]));
            // stub(gameService, 'getAllGames').returns(Promise.resolve([stubGame as GameInfo]));
            // create a mock gameService.getAllGames method that returns a promise that resolves to an array of games
            jest.spyOn(gameService, 'getAllGames').mockImplementation(async () => {
                return Promise.resolve([stubGameInfo]);
            });
            const res = {} as unknown as Response;
            res.json = (body) => {
                expect(body).toStrictEqual([stubGame as GameInfo]);
                return res;
            };
            res.status = (code) => {
                expect(code).toBe(HttpStatus.OK);
                return res;
            };

            await controller.allGames(res);
        });

        it('should return NOT_FOUND http status when request fails', async () => {
            jest.spyOn(gameService, 'getAllGames').mockRejectedValueOnce(new Error('test error'));
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
        });
    });
});
//     describe('GET /game/:id', () => {
//         it('should return a game with a specific id', async () => {
//             const spy = jest.spyOn(gameService, 'getGame').mockReturnValueOnce({
//                 gameName: 'game1',
//                 difficulty: 'easy',
//                 originalImageData: 'imageData',
//                 modifiedImageData: 'modifiedImageData',
//                 listDifferences: ['diff1', 'diff2'],
//             });

//             const res = await request(app.getHttpServer()).get('/game/game1');

//             expect(spy).toHaveBeenCalledWith('game1');
//             expect(res.status).toBe(HttpStatus.OK);
//             expect(res.body).toEqual({
//                 gameName: 'game1',
//                 difficulty: 'easy',
//                 originalImageData: 'imageData',
//                 modifiedImageData: 'modifiedImageData',
//                 listDifferences: ['diff1', 'diff2'],
//             });
//         });
//         it('should return error message', async () => {
//             const spy = jest.spyOn(gameService, 'getGame').mockReturnValueOnce({
//                 gameName: 'game2',
//                 difficulty: 'easy',
//                 originalImageData: 'imageData',
//                 modifiedImageData: 'modifiedImageData',
//                 listDifferences: ['diff1', 'diff2'],
//             });

//             const res = await request(app.getHttpServer()).get('/game/game1');

//             expect(spy).toHaveBeenCalledWith('game1');
//             expect(res.status).toBe(HttpStatus.OK);
//         });
//     });
//     describe('createGame', () => {
//         it('createGame() should return NOT_FOUND when service add the course', async () => {
//             const spy = jest.spyOn(gameService, 'addGame').mockImplementation();
//             const game = {
//                 gameName: 'kasspopobnmkieieio',
//                 difficulty: 'easy',
//                 originalImageData: 'imageData',
//                 modifiedImageData: 'modifiedImageData',
//                 listDifferences: ['diff1', 'diff2'],
//             };
//             gameService.addGame(game);
//             const res = {} as unknown as Response;
//             res.status = (code) => {
//                 expect(code).toEqual(HttpStatus.NOT_FOUND);
//                 return res;
//             };
//             res.send = () => res;
//             expect(spy).toBeCalled();
//             await controller.createGame(game, res);
//         });
//     });

//     describe('deleteGame', () => {
//         it('it should call function deleteGame from service', async () => {
//             const spy = jest.spyOn(gameService, 'deleteGame').mockImplementation();
//             const game = {
//                 gameName: 'kasspopobnmkieieio',
//                 difficulty: 'easy',
//                 originalImageData: 'imageData',
//                 modifiedImageData: 'modifiedImageData',
//                 listDifferences: ['diff1', 'diff2'],
//             };
//             gameService.addGame(game);
//             gameService.deleteGame(game.gameName);
//             expect(spy).toBeCalled();
//         });
//     });
// });
