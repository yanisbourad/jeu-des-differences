/* eslint-disable import/no-named-as-default-member */
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { GameCardHandlerGateway } from './game-card-handler.gateway';
import { GameCardHandlerService } from './game-card-handler.service';

describe('GameCardHandlerGateway', () => {
    let gateway: GameCardHandlerGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
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
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    // test updateGameStatus()
    it('updateGameStatus() should call gameCardHandlerService.updateGameStatus()', async () => {
        const payload = ['test', 'best'];
        stub(socket, 'rooms').value(new Set(['test']));
        jest.spyOn(gameCardHandlerService, 'findAllGamesStatus').mockImplementation(() => {
            const map = new Map();
            map.set('test', 1);
            map.set('best', 1);
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

        gateway.updateGameStatus(payload, socket);
        expect(logger.log).toHaveBeenCalled();
        expect(gameCardHandlerService.findAllGamesStatus).toHaveBeenCalled();
    });

    // test join
    it('Should call join with one stacked player()', async () => {
        const payload = { name: 'test', gameName: 'uno' };
        const map = new Map();
        map.set('test', 1);
        map.set('best', 1);
        // const player = { id: 'ric', name: 'test', gameName: 'uno' };
        stub(socket, 'rooms').value(new Set(['ric']));
        jest.spyOn(gameCardHandlerService, 'stackPlayer').mockImplementation(() => {
            return 1;
        });
        jest.spyOn(gameCardHandlerService, 'updateGameStatus').mockImplementation(() => {
            return map;
        });
        jest.spyOn(logger, 'log').mockImplementation(() => {
            return;
        });
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('feedbackOnJoin');
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.join(payload, socket);
        expect(logger.log).toHaveBeenCalled();
        expect(gameCardHandlerService.stackPlayer).toHaveBeenCalled();
    });
    it('Should call join with two stacked player()', async () => {
        const payload = { name: 'test', gameName: 'uno' };
        const player1 = { id: '123', name: 'test', gameName: 'uno' };
        const player2 = { id: '134', name: 'test', gameName: 'uno' };
        const map = new Map();
        map.set('test', 1);
        map.set('best', 1);
        // const player = { id: 'ric', name: 'test', gameName: 'uno' };
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
        expect(gameCardHandlerService.stackPlayer).toHaveBeenCalled();
    });

    it('Should call join with more than two stacked player()', async () => {
        const payload = { name: 'test', gameName: 'uno' };
        const player1 = { id: '123', name: 'test', gameName: 'uno' };
        const player2 = { id: '134', name: 'test', gameName: 'uno' };
        const map = new Map();
        map.set('test', 1);
        map.set('best', 1);
        // const player = { id: 'ric', name: 'test', gameName: 'uno' };
        stub(socket, 'rooms').value(new Set(['ric']));
        jest.spyOn(gameCardHandlerService, 'stackPlayer').mockImplementation(() => {
            return 3;
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
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('feedbackOnWaitLonger');
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.join(payload, socket);
        expect(logger.log).toHaveBeenCalled();
        expect(gameCardHandlerService.stackPlayer).toHaveBeenCalled();
    });
    it('Should call reject player in the stack of two()', async () => {
        const player1 = { id: '123', name: 'test', gameName: 'uno' };
        const player2 = { id: '134', name: 'test', gameName: 'uno' };
        const player3 = { id: '144', name: 'test', gameName: 'uno' };
        stub(socket, 'rooms').value(new Set(['test']));
        jest.spyOn(gameCardHandlerService, 'getPlayer').mockReturnValueOnce(player1);
        jest.spyOn(gameCardHandlerService, 'deleteOpponent').mockReturnValueOnce(player2);
        jest.spyOn(gameCardHandlerService, 'handleReject').mockReturnValueOnce(player3);
        jest.spyOn(logger, 'log').mockImplementation(() => {
            return;
        });
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                if (event === 'feedbackOnReject') expect(event).toEqual('feedbackOnReject');
                if (event === 'feedbackOnWait') expect(event).toEqual('feedbackOnWait');
                if (event === 'feedbackOnJoin') expect(event).toEqual('feedbackOnJoin');
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.reject(socket);
        expect(logger.log).toHaveBeenCalled();
    });
    it('Should call reject player and do nothing when creator is alone()', async () => {
        const player1 = { id: '123', name: 'test', gameName: 'uno' };
        stub(socket, 'rooms').value(new Set(['test']));
        jest.spyOn(gameCardHandlerService, 'getPlayer').mockReturnValueOnce(player1);
        jest.spyOn(gameCardHandlerService, 'deleteOpponent').mockReturnValueOnce(null);
        jest.spyOn(gameCardHandlerService, 'handleReject').mockReturnValueOnce(null);
        jest.spyOn(logger, 'log').mockImplementation(() => {
            return;
        });
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                if (event === 'feedbackOnReject') expect(event).toEqual('feedbackOnReject');
                if (event === 'feedbackOnWait') expect(event).toEqual('feedbackOnWait');
                if (event === 'feedbackOnJoin') expect(event).toEqual('feedbackOnJoin');
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.reject(socket);
        expect(logger.log).toHaveBeenCalled();
    });
    it('Should call accept player when creator agreed()', async () => {
        const player1 = { id: '123', name: 'test', gameName: 'uno' };
        const player2 = { id: '134', name: 'test', gameName: 'uno' };
        const map = new Map();
        map.set('test', 1);
        map.set('best', 1);
        stub(socket, 'rooms').value(new Set(['123']));
        jest.spyOn(gameCardHandlerService, 'updateGameStatus').mockImplementation(() => {
            return map;
        });
        jest.spyOn(gameCardHandlerService, 'acceptOpponent').mockReturnValueOnce([player1, player2]);
        jest.spyOn(gameCardHandlerService, 'removePlayers').mockReturnValueOnce(['234']);
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
});
