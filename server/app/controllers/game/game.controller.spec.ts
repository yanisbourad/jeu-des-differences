import { GameService } from '@app/services/game/game.service';
import { Game, GameInfo, TimeConfig } from '@common/game';
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
    let stubConstants: TimeConfig;
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
            rankingMulti: [],
            rankingSolo: [],
        } as GameInfo;

        stubConstants = {
            timeInit: 30,
            timePen: 5,
            timeBonus: 5,
        } as TimeConfig;
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
                expect(body).toStrictEqual([stubGameInfo]);
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
            await controller.allGames(res);
        });
    });

    describe('GET /game/:id', () => {
        it('should return a game with a specific id', async () => {
            const spy = jest.spyOn(gameService, 'getGame').mockImplementation(() => {
                return stubGame;
            });

            const res = {} as unknown as Response;
            res.status = (code) => {
                expect(code).toBe(HttpStatus.OK);
                return res;
            };
            res.json = (body) => {
                expect(body).toStrictEqual(stubGame);
                return res;
            };

            await controller.gameId('game1', res);
            expect(spy).toHaveBeenCalledWith('game1');
        });

        it('should return error message', async () => {
            const spy = jest.spyOn(gameService, 'getGame').mockImplementation(() => {
                throw new Error('test error');
            });

            const res = {} as unknown as Response;
            res.status = (code) => {
                expect(code).toBe(HttpStatus.NOT_FOUND);
                return res;
            };
            res.send = (message) => {
                expect(message).toBe('test error');
                return res;
            };
            await controller.gameId('game1', res);
            expect(spy).toHaveBeenCalledWith('game1');
        });
    });
    describe('createGame', () => {
        it('createGame() should return OK when service add the Game', async () => {
            const spy = jest.spyOn(gameService, 'addGame').mockImplementation();
            const res = {} as unknown as Response;
            res.status = (code) => {
                expect(code).toEqual(HttpStatus.OK);
                return res;
            };
            res.json = (message) => {
                expect(message).toEqual('Game added successfully');
                return res;
            };
            res.send = () => res;
            await controller.createGame(stubGame, res);
            expect(spy).toBeCalled();
        });
        it('createGame() should return BAD_REQUEST when service add the Game', async () => {
            const spy = jest.spyOn(gameService, 'addGame').mockImplementation(() => {
                throw new Error('test error');
            });
            const res = {} as unknown as Response;
            res.status = (code) => {
                expect(code).toEqual(HttpStatus.BAD_REQUEST);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual('test error');
                return res;
            };
            await controller.createGame(stubGame, res);
            expect(spy).toBeCalled();
        });

        it('should return a boolean response in validate game name', async () => {
            let spy = jest.spyOn(gameService, 'isValidGameName').mockImplementation(() => {
                return true;
            });
            const res = {} as unknown as Response;
            res.status = (code) => {
                expect(code).toBe(HttpStatus.OK);
                return res;
            };
            res.json = (body) => {
                expect(body).toBe(true);
                return res;
            };

            await controller.validateGameName('game1', res);

            expect(spy).toHaveBeenCalledWith('game1');
            spy = jest.spyOn(gameService, 'isValidGameName').mockImplementation(() => {
                return false;
            });
            res.json = (body) => {
                expect(body).toBe(false);
                return res;
            };
            await controller.validateGameName('game1', res);
            expect(spy).toHaveBeenCalledWith('game1');
        });
    });

    describe('deleteGame', () => {
        it('it should call function deleteGame from service', async () => {
            const spy = jest.spyOn(gameService, 'deleteGame').mockImplementation();
            const res = {} as unknown as Response;
            res.status = (code) => {
                expect(code).toEqual(HttpStatus.OK);
                return res;
            };
            res.json = (message) => {
                expect(message).toEqual('Game deleted successfully');
                return res;
            };
            res.send = () => res;
            await controller.deleteGame('game1', res);

            expect(spy).toBeCalled();
        });

        it('it should return BAD_REQUEST when service delete the Game', async () => {
            const spy = jest.spyOn(gameService, 'deleteGame').mockImplementation(() => {
                throw new Error('test error');
            });
            const res = {} as unknown as Response;
            res.status = (code) => {
                expect(code).toEqual(HttpStatus.BAD_REQUEST);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual('test error');
                return res;
            };
            await controller.deleteGame('game1', res);
            expect(spy).toBeCalled();
        });
    });

    describe('GET /game/constants', () => {
        it('should return constants', async () => {
            const spy = jest.spyOn(gameService, 'getConstants').mockImplementation(async () => {
                return Promise.resolve(stubConstants);
            });

            const res = {} as unknown as Response;
            res.status = (code) => {
                expect(code).toBe(HttpStatus.OK);
                return res;
            };
            res.json = (body) => {
                expect(body).toStrictEqual(stubConstants);
                return res;
            };

            await controller.getConstants(res);
            expect(spy).toHaveBeenCalled();
        });

        it('should return error message', async () => {
            const spy = jest.spyOn(gameService, 'getConstants').mockImplementation(async () => {
                throw new Error('test error');
            });

            const res = {} as unknown as Response;
            res.status = (code) => {
                expect(code).toBe(HttpStatus.NOT_FOUND);
                return res;
            };
            res.send = (message) => {
                expect(message).toBe('test error');
                return res;
            };
            await controller.getConstants(res);
            expect(spy).toHaveBeenCalled();
        });
    });
    describe('PUT constants', () => {
        it('updateConstants() should return OK when service update constants', async () => {
            const spy = jest.spyOn(gameService, 'updateConstants').mockImplementation();
            const res = {} as unknown as Response;
            res.status = (code) => {
                expect(code).toEqual(HttpStatus.OK);
                return res;
            };
            res.json = (message) => {
                expect(message).toEqual('constants updated successfully');
                return res;
            };
            res.send = () => res;
            await controller.updateConstants(stubConstants, res);
            expect(spy).toBeCalled();
        });
        it('createGame() should return BAD_REQUEST when service add the Game', async () => {
            const spy = jest.spyOn(gameService, 'updateConstants').mockImplementation(() => {
                throw new Error('test error');
            });
            const res = {} as unknown as Response;
            res.status = (code) => {
                expect(code).toEqual(HttpStatus.BAD_REQUEST);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual('test error');
                return res;
            };
            await controller.updateConstants(stubConstants, res);
            expect(spy).toBeCalled();
        });
    });

    describe('deleteAllGames', () => {
        it('it should call function deleteAllGames from service', async () => {
            const spy = jest.spyOn(gameService, 'deleteAllGames').mockImplementation();
            const res = {} as unknown as Response;
            res.status = (code) => {
                expect(code).toEqual(HttpStatus.OK);
                return res;
            };
            res.json = (message) => {
                expect(message).toEqual('Games deleted successfully');
                return res;
            };
            res.send = () => res;
            await controller.deleteAllGames(res);
            expect(spy).toBeCalled();
        });

        it('it should return BAD_REQUEST when service delete the Game', async () => {
            const spy = jest.spyOn(gameService, 'deleteAllGames').mockImplementation(() => {
                throw new Error('test error');
            });
            const res = {} as unknown as Response;
            res.status = (code) => {
                expect(code).toEqual(HttpStatus.BAD_REQUEST);
                return res;
            };
            res.send = (message) => {
                expect(message).toEqual('test error');
                return res;
            };
            await controller.deleteAllGames(res);
            expect(spy).toBeCalled();
        });
    });
});
