/* eslint-disable import/no-named-as-default-member */
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { GameCardHandlerGateway } from './game-card-handler.gateway';
import { GameCardHandlerService } from './game-card-handler.service';

fdescribe('GameCardHandlerGateway', () => {
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
});
