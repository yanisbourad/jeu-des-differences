import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Logger } from '@nestjs/common';
import { SinonStubbedInstance, createStubInstance, match } from 'sinon';
import { Socket, Server } from 'socket.io';
import { ChatEvents } from './chat.gateway.events';
import { DELAY_BEFORE_EMITTING_TIME } from './chat.gateway.constants';

describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatGateway,
                {
                    provide: Logger,
                    useValue: logger,
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

    it('joinRoom() should join the socket room', () => {
        // gateway.joinRoom(socket);
        expect(socket.join.calledOnce).toBeTruthy();
    });

    it('afterInit() should emit time after 1s', () => {
        // to customize for us
        jest.useFakeTimers();
        gateway.afterInit();
        jest.advanceTimersByTime(DELAY_BEFORE_EMITTING_TIME);
        expect(server.emit.calledWith(ChatEvents.Time, match.any)).toBeTruthy(); // i changed clock to time
    });

    it('hello message should be sent on connection', () => {
        gateway.handleConnection(socket);
        expect(socket.emit.calledWith(ChatEvents.Hello, match.any)).toBeTruthy();
    });

    it('socket disconnection should be logged', () => {
        gateway.handleDisconnect(socket);
        expect(logger.log.calledOnce).toBeTruthy();
    });
});
