/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { PlayerService } from '@app/services/player/player-service';
import { ServerTimeService } from '@app/services/time/server-time.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Subscription } from 'rxjs';
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
    let timeService: SinonStubbedInstance<ServerTimeService>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        playerService = createStubInstance<PlayerService>(PlayerService);
        timeService = createStubInstance<ServerTimeService>(ServerTimeService);
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
                {
                    provide: ServerTimeService,
                    useValue: timeService,
                },
            ],
        }).compile();

        gateway = module.get<ChatGateway>(ChatGateway);
        // We want to assign a value to the private field
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
        const playerName = 'John Doe';
        timeService.timers = {
            timer1: new Subscription(),
            timer2: new Subscription(),
            timer3: new Subscription(),
        };
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

    // it('joinRoom() should start the chronometer', async () => {
    //     timeService.timers = {};
    //     const playerName = 'test';
    //     jest.spyOn(playerService, 'addPlayer').mockImplementation(async () => {
    //         return Promise.resolve();
    //     });
    //     jest.spyOn(timeService, 'startChronometer').mockImplementation(jest.fn());
    //     jest.spyOn(playerService, 'getRoomIndex').mockResolvedValue(0);
    //     await gateway.joinRoom(socket, playerName);
    //     expect(timeService.startChronometer).toBeCalled();
    //     expect(playerService.addPlayer).toHaveBeenCalled();
    // });

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

    it('afterInit() should call the emitTime()', () => {
        jest.spyOn(gateway, 'emitTime').mockImplementation(jest.fn());
        gateway.afterInit();
        expect(gateway.emitTime).toBeCalled();
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

    jest.useFakeTimers();
    it('emitTime() should emit the time', () => {
        gateway.emitTime();
        timeService.elapsedTimes = new Map<string, number>([
            ['timer1', 0],
            ['timer2', 100],
            ['timer3', 200],
        ]);
        jest.advanceTimersByTime(1000);
        expect(server.emit.calledWith(ChatEvents.ServerTime, match.any)).toBeTruthy();
    });

    it('stopTimer() should call stopChronometer() with correct parameter', () => {
        jest.spyOn(timeService, 'stopChronometer').mockImplementation(jest.fn());
        gateway.stopTimer(socket, 'timer1');
        expect(timeService.stopChronometer).toBeCalledWith('timer1');
    });
});
