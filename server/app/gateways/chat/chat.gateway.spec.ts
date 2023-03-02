import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { PlayerService } from '@app/services/player/player-service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, match, SinonStubbedInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { INDEX_NOT_FOUND } from './chat.gateway.constants';
import { ChatEvents } from './chat.gateway.events';

describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let playerService: SinonStubbedInstance<PlayerService>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        playerService = createStubInstance<PlayerService>(PlayerService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatGateway,
                PlayerService,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: PlayerService,
                    useValue: playerService,
                },
            ],
        }).compile();

        gateway = module.get<ChatGateway>(ChatGateway);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('joinRoom() should join the socket room', async () => {
        await gateway.joinRoom(socket, 'some name');
        expect(socket.join.calledOnce).toBeTruthy();
    });

    it('JoinRoom() should add a room if the player does not have one', async () => {
        const playerName = 'test';
        jest.spyOn(playerService, 'getRoomIndex').mockResolvedValue(INDEX_NOT_FOUND);
        jest.spyOn(playerService, 'addRoom').mockImplementation(async () => {
            return Promise.resolve();
        });
        await gateway.joinRoom(socket, playerName);
        expect(playerService.addRoom).toHaveBeenCalled();
    });

    it('joinRoom() should add a player if they already have a room', async () => {
        const playerName = 'test';
        jest.spyOn(playerService, 'getRoomIndex').mockResolvedValue(0);
        jest.spyOn(playerService, 'addPlayer').mockImplementation(async () => {
            return Promise.resolve();
        });
        await gateway.joinRoom(socket, playerName);
        expect(playerService.addPlayer).toHaveBeenCalled();
    });

    it('leaveRoom() should leave the socket room and call removeRoom() from playerService', async () => {
        jest.spyOn(playerService, 'removeRoom').mockImplementation(async () => {
            return Promise.resolve();
        });
        await gateway.leaveRoom(socket);
        expect(socket.leave.calledOnce).toBeTruthy();
        expect(playerService.removeRoom).toHaveBeenCalled();
    });

    it('hello message should be sent on connection and logger.log method shoud be called', () => {
        gateway.handleConnection(socket);
        expect(logger.log.calledOnce).toBeTruthy();
        expect(socket.emit.calledWith(ChatEvents.Hello, match.any)).toBeTruthy();
    });

    it('socket disconnection should be logged', () => {
        gateway.handleDisconnect(socket);
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('socket disconnection should call removeRoom() from playerService and leave room', async () => {
        jest.spyOn(playerService, 'removeRoom').mockImplementation(async () => {
            return Promise.resolve();
        });
        await gateway.handleDisconnect(socket);
        expect(playerService.removeRoom).toHaveBeenCalled();
        expect(socket.leave.calledOnce).toBeTruthy();
    });

    it('afterInit() should call the logger.log method', () => {
        gateway.afterInit();
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('connect() should emit a message and call the logger.log method', () => {
        gateway.connect(socket, 'some message');
        expect(logger.log.calledOnce).toBeTruthy();
        expect(server.emit.calledWith(ChatEvents.Message, match.any)).toBeTruthy();
    });

    it('getSocketId() should return the socket id', () => {
        gateway.handleConnection(socket);
        expect(gateway.getSocketId()).toEqual(socket.id);
    });
});
