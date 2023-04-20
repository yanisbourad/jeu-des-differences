/* eslint-disable max-lines */
/* eslint-disable import/no-named-as-default-member */
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { MULTIPLE_REQUEST } from './entities/constants';
import { GameCardHandlerGateway } from './game-card-handler.gateway';
import { GameCardHandlerService } from './game-card-handler.service';

describe('GameCardHandlerGateway', () => {
    let gateway: GameCardHandlerGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let player1, player2, player3, player4, player5, map, payload, payloadLimited;
    let gameCardHandlerService: SinonStubbedInstance<GameCardHandlerService>;
    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        gameCardHandlerService = createStubInstance<GameCardHandlerService>(GameCardHandlerService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameCardHandlerGateway,
                GameCardHandlerService,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: GameCardHandlerService,
                    useValue: gameCardHandlerService,
                },
            ],
        }).compile();

        gateway = module.get<GameCardHandlerGateway>(GameCardHandlerGateway);
        gateway['server'] = server;
        payload = { name: 'test', gameName: 'uno', gameType: 'Double' };
        payloadLimited = { name: 'test', gameName: 'uno', gameType: 'limit' };
        player1 = { id: '121', name: 'test', gameName: 'uno', gameType: 'classic' };
        player2 = { id: '122', name: 'test', gameName: 'uno', gameType: 'classic' };
        player3 = { id: '123', name: 'test', gameName: 'uno', gameType: 'classic' };
        player4 = { id: '124', name: 'test', gameName: 'uno', gameType: 'limit' };
        map = new Map();
        map.set('test', 1);
        map.set('best', 1);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
    it('updateGameStatus() should call gameCardHandlerService.updateGameStatus()', async () => {
        const payload1 = ['test', 'best'];
        stub(socket, 'rooms').value(new Set(['test']));
        jest.spyOn(gameCardHandlerService, 'findAllGamesStatus').mockImplementation(() => {
            return map;
        });
        jest.spyOn(logger, 'log').mockImplementation(() => {
            return;
        });
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('updateStatus');
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.updateGameStatus(payload1, socket);
        expect(logger.log).toHaveBeenCalled();
        expect(gameCardHandlerService.findAllGamesStatus).toHaveBeenCalled();
    });
    it('Should call join with one stacked player()', async () => {
        stub(socket, 'rooms').value(new Set(['ric']));
        jest.spyOn(gameCardHandlerService, 'stackPlayer').mockImplementation(() => {
            return 1;
        });
        jest.spyOn(gameCardHandlerService, 'isGameAvailable').mockImplementation(() => {
            return true;
        });
        jest.spyOn(gameCardHandlerService, 'updateGameStatus').mockImplementation(() => {
            return map;
        });
        jest.spyOn(logger, 'log').mockImplementation(() => {
            return;
        });
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                if (event === 'updateStatus') expect(event).toEqual('updateStatus');
                if (event === 'globalEvent') expect(event).toEqual('globalEvent');
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.join(payload, socket);
        expect(logger.log).toHaveBeenCalled();
        expect(gameCardHandlerService.isGameAvailable).toHaveBeenCalled();
        expect(gameCardHandlerService.stackPlayer).toHaveBeenCalled();
    });
    it('Should call isGameAvailable when calling join', async () => {
        stub(socket, 'rooms').value(new Set(['ric']));
        jest.spyOn(gameCardHandlerService, 'isGameAvailable').mockImplementation(() => {
            return false;
        });
        jest.spyOn(gameCardHandlerService, 'updateGameStatus').mockImplementation(() => {
            return map;
        });
        jest.spyOn(logger, 'log').mockImplementation(() => {
            return;
        });
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                if (event === 'updateStatus') expect(event).toEqual('updateStatus');
                if (event === 'globalEvent') expect(event).toEqual('globalEvent');
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.join(payload, socket);
        expect(logger.log).toHaveBeenCalled();
        expect(gameCardHandlerService.isGameAvailable).toHaveBeenCalled();
    });
    it('Should call JoinLimitedTimeMode when calling join', async () => {
        stub(socket, 'rooms').value(new Set(['ric']));
        jest.spyOn(gameCardHandlerService, 'manageJoinLimitMode').mockImplementation(() => {
            return [player1];
        });
        jest.spyOn(gameCardHandlerService, 'updateGameStatus').mockImplementation(() => {
            return map;
        });
        jest.spyOn(logger, 'log').mockImplementation(() => {
            return;
        });
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                if (event === 'updateStatus') expect(event).toEqual('updateStatus');
                if (event === 'globalEvent') expect(event).toEqual('globalEvent');
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.join(payloadLimited, socket);
        expect(logger.log).toHaveBeenCalled();
    });
    // test for joinClassicMode(player: Player)  in game-card-handler.gateway.ts
    it('Should call manageJoinLimitMode when calling joinLimitedTimeMode with one player', async () => {
        stub(socket, 'rooms').value(new Set(['ric']));
        jest.spyOn(gameCardHandlerService, 'manageJoinLimitMode').mockImplementation(() => {
            return [player1];
        });
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('globalEvent');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.joinLimitedTimeMode(player1);
    });
    it('Should call manageJoinLimitMode when calling joinLimitedTimeMode with two players', async () => {
        stub(socket, 'rooms').value(new Set(['ric']));
        jest.spyOn(gameCardHandlerService, 'manageJoinLimitMode').mockImplementation(() => {
            return [player1, player2];
        });
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('globalEvent');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.joinLimitedTimeMode(player1);
    });

    it('Should call join with two stacked player()', async () => {
        stub(socket, 'rooms').value(new Set(['ric']));
        jest.spyOn(gameCardHandlerService, 'stackPlayer').mockImplementation(() => {
            return 2;
        });
        jest.spyOn(gameCardHandlerService, 'updateGameStatus').mockImplementation(() => {
            return map;
        });
        jest.spyOn(gameCardHandlerService, 'getStackedPlayers').mockImplementation(() => {
            return ['123', '134'];
        });
        jest.spyOn(gameCardHandlerService, 'getPlayer').mockReturnValueOnce(player2);
        jest.spyOn(gameCardHandlerService, 'getPlayer').mockReturnValueOnce(player1);
        jest.spyOn(logger, 'log').mockImplementation(() => {
            return;
        });
        jest.spyOn(gameCardHandlerService, 'isGameAvailable').mockImplementation(() => {
            return true;
        });
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('feedbackOnWait');
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                if (event === 'feedbackOnAccept') expect(event).toEqual('feedbackOnAccept');
                if (event === 'feedbackOnWait') expect(event).toEqual('feedbackOnWait');
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.join(payload, socket);
        expect(logger.log).toHaveBeenCalled();
        expect(gameCardHandlerService.isGameAvailable).toHaveBeenCalled();
        expect(gameCardHandlerService.stackPlayer).toHaveBeenCalled();
    });
    it('Should call join with more than two stacked player()', async () => {
        stub(socket, 'rooms').value(new Set(['ric']));
        jest.spyOn(gameCardHandlerService, 'stackPlayer').mockImplementation(() => {
            return 3;
        });
        jest.spyOn(gameCardHandlerService, 'updateGameStatus').mockImplementation(() => {
            return map;
        });
        jest.spyOn(gameCardHandlerService, 'getStackedPlayers').mockImplementation(() => {
            return ['122', '121'];
        });
        jest.spyOn(gameCardHandlerService, 'getPlayer').mockReturnValueOnce(player2);
        jest.spyOn(gameCardHandlerService, 'getPlayer').mockReturnValueOnce(player1);
        jest.spyOn(logger, 'log').mockImplementation(() => {
            return;
        });
        jest.spyOn(gameCardHandlerService, 'isGameAvailable').mockImplementation(() => {
            return true;
        });
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                if (event === 'feedbackOnWaitLonger') expect(event).toEqual('feedbackOnWaitLonger');
                if (event === 'gameUnavailable') expect(event).toEqual('gameUnavailable');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.join(payload, socket);
        expect(logger.log).toHaveBeenCalled();
        expect(gameCardHandlerService.isGameAvailable).toHaveBeenCalled();
        expect(gameCardHandlerService.stackPlayer).toHaveBeenCalled();
    });
    it('Should call reject player in the stack of two()', async () => {
        stub(socket, 'rooms').value(new Set(['test']));
        jest.spyOn(gameCardHandlerService, 'getPlayer').mockReturnValueOnce(player1);
        jest.spyOn(gameCardHandlerService, 'deleteOpponent').mockReturnValueOnce(player2);
        jest.spyOn(gameCardHandlerService, 'handleReject').mockReturnValueOnce(player3);
        jest.spyOn(logger, 'log').mockImplementation(() => {
            return;
        });
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                if (event === 'globalEvent') expect(event).toEqual('globalEvent');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.reject(socket);
        expect(logger.log).toHaveBeenCalled();
    });
    it('Should call reject player and do nothing when creator is alone()', async () => {
        stub(socket, 'rooms').value(new Set(['test']));
        jest.spyOn(gameCardHandlerService, 'getPlayer').mockReturnValueOnce(player1);
        jest.spyOn(gameCardHandlerService, 'deleteOpponent').mockReturnValueOnce(null);
        jest.spyOn(gameCardHandlerService, 'handleReject').mockReturnValueOnce(null);
        jest.spyOn(logger, 'log').mockImplementation(() => {
            return;
        });
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                if (event === 'globalEvent') expect(event).toEqual('globalEvent');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.reject(socket);
        expect(logger.log).toHaveBeenCalled();
    });
    it('Should call accept player when creator agreed()', async () => {
        stub(socket, 'rooms').value(new Set(['123']));
        jest.spyOn(gameCardHandlerService, 'updateGameStatus').mockImplementation(() => {
            return map;
        });
        jest.spyOn(gameCardHandlerService, 'acceptOpponent').mockReturnValueOnce([player1, player2]);
        jest.spyOn(gameCardHandlerService, 'removePlayers').mockReturnValueOnce(['124']);
        jest.spyOn(logger, 'log').mockImplementation(() => {
            return;
        });
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                if (event === 'feedbackOnStart') expect(event).toEqual('feedbackOnStart');
                if (event === 'byeTillNext') expect(event).toEqual('byeTillNext');
                if (event === 'updateStatus') expect(event).toEqual('updateStatus');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.accept(socket);
        expect(logger.log).toHaveBeenCalled();
    });
    it('Should call delete when game is deleted()', async () => {
        stub(socket, 'rooms').value(new Set(['123']));
        jest.spyOn(gameCardHandlerService, 'getTotalRequest').mockReturnValueOnce(MULTIPLE_REQUEST);
        jest.spyOn(gameCardHandlerService, 'deleteAllWaitingPlayerByGame').mockReturnValueOnce(['123', '134']);
        jest.spyOn(logger, 'log').mockImplementation(() => {
            return;
        });
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('globalEvent');
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.delete('name');
        expect(logger.log).toHaveBeenCalled();
    });
    it('Should remove opponent player issuing incoming request to cancel', async () => {
        stub(socket, 'rooms').value(new Set(['123']));
        jest.spyOn(gameCardHandlerService, 'getPlayer').mockReturnValueOnce(player1);
        jest.spyOn(gameCardHandlerService, 'getTotalRequest').mockReturnValueOnce(3);
        jest.spyOn(gameCardHandlerService, 'deletePlayer').mockReturnValueOnce(player2);
        jest.spyOn(gameCardHandlerService, 'getPlayer').mockReturnValueOnce(player3);
        jest.spyOn(gameCardHandlerService, 'removeOpponent').mockReturnValueOnce(['122', '123']);
        jest.spyOn(gameCardHandlerService, 'removePlayerInJoiningQueue').mockReturnValueOnce(false);
        jest.spyOn(gameCardHandlerService, 'isCreator').mockReturnValueOnce(false);
        jest.spyOn(gameCardHandlerService, 'getPlayer').mockReturnValueOnce(player3);
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                if (event === 'globalEvent') expect(event).toEqual('globalEvent');
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(logger, 'log').mockImplementation(() => {
            return;
        });
        jest.spyOn(gameCardHandlerService, 'updateGameStatus').mockImplementation(() => {
            return map;
        });
        gateway.cancel('uno', socket);
    });
    it('Should handle limited time to cancel and remove the player', async () => {
        stub(socket, 'rooms').value(new Set(['124']));
        jest.spyOn(gameCardHandlerService, 'getPlayer').mockReturnValueOnce(player4);
        jest.spyOn(gameCardHandlerService, 'handleLimitedTimeCancel').mockReturnValueOnce(player4);
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                if (event === 'globalEvent') expect(event).toEqual('globalEvent');
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(logger, 'log').mockImplementation(() => {
            return;
        });
        gateway.cancel('uno', socket);
    });
    it('Should remove opponent player and inform game creator', async () => {
        stub(socket, 'rooms').value(new Set(['122']));
        jest.spyOn(gameCardHandlerService, 'getPlayer').mockReturnValueOnce(player2);
        jest.spyOn(gameCardHandlerService, 'getTotalRequest').mockReturnValueOnce(2);
        jest.spyOn(gameCardHandlerService, 'deletePlayer').mockReturnValueOnce(player2);
        jest.spyOn(gameCardHandlerService, 'isCreator').mockReturnValueOnce(false);
        jest.spyOn(gameCardHandlerService, 'removePlayerInJoiningQueue').mockReturnValueOnce(false);
        jest.spyOn(gameCardHandlerService, 'removeOpponent').mockReturnValueOnce(['122']);
        jest.spyOn(gameCardHandlerService, 'getPlayer').mockReturnValueOnce(player1);
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                if (event === 'globalEvent') expect(event).toEqual('globalEvent');
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(logger, 'log').mockImplementation(() => {
            return;
        });
        jest.spyOn(gameCardHandlerService, 'updateGameStatus').mockImplementation(() => {
            return map;
        });
        gateway.cancel('uno', socket);
    });
    it('Should call handle disconnect when time limited player is disconnected()', async () => {
        stub(socket, 'rooms').value(new Set(['123']));
        jest.spyOn(gameCardHandlerService, 'getPlayer').mockReturnValueOnce(player4);
        jest.spyOn(gameCardHandlerService, 'getPlayer').mockReturnValueOnce(player1);
        jest.spyOn(gameCardHandlerService, 'deletePlayer').mockReturnValueOnce(null);
        gateway.handleDisconnect(socket);
        expect(gameCardHandlerService.deletePlayer).toHaveBeenCalled();
    });
    it('Should call handle cancel when player cancel the game()', async () => {
        stub(socket, 'rooms').value(new Set(['123']));
        jest.spyOn(gameCardHandlerService, 'getPlayer').mockReturnValueOnce(player1);
        jest.spyOn(gameCardHandlerService, 'getTotalRequest').mockReturnValueOnce(1);
        jest.spyOn(gameCardHandlerService, 'deletePlayer').mockReturnValueOnce(player1);
        jest.spyOn(gameCardHandlerService, 'deleteCreator').mockReturnValueOnce(['123', '134']);
        jest.spyOn(gameCardHandlerService, 'removeOpponent').mockReturnValueOnce(['123', '134']);
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                if (event === 'globalEvent') expect(event).toEqual('globalEvent');
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(logger, 'log').mockImplementation(() => {
            return;
        });
        jest.spyOn(gameCardHandlerService, 'updateGameStatus').mockImplementation(() => {
            return map;
        });
        gateway.cancel('uno', socket);
        expect(logger.log).toHaveBeenCalled();
    });
    it('Should call cancel when a player is a creator ()', async () => {
        const opponent = {
            id: 'client id',
            emit: jest.fn(),
        } as unknown as jest.Mocked<Socket>;
        stub(socket, 'rooms').value(new Set(['123']));
        jest.spyOn(gameCardHandlerService, 'getPlayer').mockReturnValueOnce(player1);
        jest.spyOn(gameCardHandlerService, 'deletePlayer').mockReturnValueOnce(player4);
        jest.spyOn(gameCardHandlerService, 'isCreator').mockReturnValueOnce(true);
        jest.spyOn(gameCardHandlerService, 'getTotalRequest').mockReturnValueOnce(2);
        jest.spyOn(gameCardHandlerService, 'deleteCreator').mockReturnValueOnce(['123', '134']);
        jest.spyOn(gameCardHandlerService, 'deletePlayer').mockReturnValueOnce(player2);
        jest.spyOn(gameCardHandlerService, 'removePlayers').mockReturnValueOnce(['1232', '134w']);
        jest.spyOn(gameCardHandlerService, 'removePlayers').mockReturnValueOnce(['123', opponent.id]);
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('globalEvent');
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(logger, 'log').mockImplementation(() => {
            return;
        });
        jest.spyOn(gameCardHandlerService, 'updateGameStatus').mockImplementation(() => {
            return map;
        });
        gateway.cancel('uno', socket);
        expect(logger.log).toHaveBeenCalled();
    });
});
