/* eslint-disable import/no-named-as-default-member */
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server } from 'socket.io';
import { GameCardHandlerGateway } from './game-card-handler.gateway';
import { GameCardHandlerService } from './game-card-handler.service';

describe('GameCardHandlerGateway', () => {
    let gateway: GameCardHandlerGateway;
    let logger: SinonStubbedInstance<Logger>;
    // let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let gameCardHandlerService: SinonStubbedInstance<GameCardHandlerService>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        // socket = createStubInstance<Socket>(Socket);
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

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    // should be called when a client connects
    // it('handleConnection should be called', async () => {
    //     const spy = jest.spyOn(gateway, 'updateGameStatus');
    //     gateway.updateGameStatus({}, socket);
    //     expect(spy).toHaveBeenCalled();
    // });

    // it('findAllGamesStatus should call the service', async () => {
    //     gateway.updateGameStatus('some name', socket);
    //     socket.join('test');
    //     expect(server.to.calledWith('test')).toBe(true);
    //     expect(server.emit.calledWith('updateStatus', 'data1')).toBe(true);
    //     expect(gameCardHandlerService.findAllGamesStatus.calledOnce).toBeTruthy();
    // });

    // it('updateGameStatus should call the service', async () => {
    //     gateway.updateGameStatus('some name', socket);
    //     socket.join('test');
    //     expect(server.to.calledWith('test')).toBe(true);
    //     expect(server.emit.calledWith('updateStatus', 'data1')).toBe(true);
    //     expect(gameCardHandlerService.updateGameStatus.calledOnce).toBeTruthy();
    // });
});
