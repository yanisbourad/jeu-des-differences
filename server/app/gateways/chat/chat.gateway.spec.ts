/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { ServerTimeService } from '@app/services/time/server-time.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Subscription } from 'rxjs';
import { createStubInstance, match, SinonStubbedInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { ChatEvents } from './chat.gateway.events';
import { GameService } from '@app/services/game/game.service';

describe('ChatGateway', () => {
    let gateway: ChatGateway;
    let logger: SinonStubbedInstance<Logger>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let timeService: SinonStubbedInstance<ServerTimeService>;
    let gameService: SinonStubbedInstance<GameService>;
    const testPlayer1 = {
        socketId: 'player1_socket_id',
        id: 'player.gameId',
        creatorName: 'player1',
        gameName: 'player.gameName',
        opponentName: 'player2',
    };
    const testPlayer2 = {
        socketId: 'player2_socket_id',
        id: 'player.gameId',
        creatorName: 'player2',
        gameName: 'player.gameName',
        opponentName: 'player1',
    };
    const testPlayer3 = {
        socketId: 'player3_socket_id',
        id: 'player.gameId2',
        creatorName: 'player3',
        gameName: 'player.gameName',
        opponentName: 'player1',
    };

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        timeService = createStubInstance<ServerTimeService>(ServerTimeService);
        gameService = createStubInstance<GameService>(GameService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatGateway,
                ServerTimeService,
                GameService,
                {
                    provide: Logger,
                    useValue: logger,
                },
                {
                    provide: ServerTimeService,
                    useValue: timeService,
                },
                {
                    provide: GameService,
                    useValue: gameService,
                },
            ],
        }).compile();
        gateway = module.get<ChatGateway>(ChatGateway);
        // We want to assign a value to the private field
        gateway['server'] = server;
        timeService.timers = {
            timer1: new Subscription(),
            timer2: new Subscription(),
            timer3: new Subscription(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('connect() should call the logger.log method', () => {
        gateway.connect(socket);
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('socket handleConnection should be logged', () => {
        gateway.handleConnection(socket);
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('socket disconnection should be logged', () => {
        gateway.handleDisconnect(socket);
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('handleDisconnect should leave room and called removeRoom', async () => {
        // jest.spyOn(playerService, 'removeRoom').mockImplementation(async () => {
        //     return Promise.resolve();
        // });
        await gateway.handleDisconnect(socket);
        expect(socket.leave.calledOnce).toBeTruthy();
    });

    it('afterInit() should trigger emit serverTime with correct parameters ', () => {
        // jest.spyOn(gateway, 'emitTime').mockImplementation(jest.fn());
        gateway.afterInit();
        // expect(gateway.emitTime).toBeCalled();
    });

    it('joinRoomSolo() should join the socket room', async () => {
        // jest.spyOn(playerService, 'getRoomIndex').mockResolvedValue(INDEX_NOT_FOUND);
        // await gateway.joinRoomSolo(socket, 'some name');
        expect(socket.join.calledOnce).toBeTruthy();
    });

    it('JoinRoomSolo() should add a room if the player does not have one', async () => {
        const playerName = 'John Doe';
        // jest.spyOn(playerService, 'getRoomIndex').mockResolvedValue(INDEX_NOT_FOUND);
        // jest.spyOn(playerService, 'addRoomSolo').mockImplementation(async () => {
        //     return Promise.resolve();
        // });
        // await gateway.joinRoomSolo(socket, playerName);
        // // expect(playerService.addRoomSolo).toHaveBeenCalled();
    });

    it('joinRoomSolo() should call getGame', async () => {
        const playerName = 'test';
        const gameName = 'test'
        await gateway.joinRoomSolo(socket, {playerName, gameName });
        // expect(playerService.getGame).toHaveBeenCalled();
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('joinRoomSolo() should start the timer for the room', async () => {
        const playerName = 'test';
        // jest.spyOn(playerService, 'getRoomIndex').mockResolvedValue(INDEX_NOT_FOUND);
        // jest.spyOn(playerService, 'addRoomSolo').mockImplementation(async () => {
        //     return Promise.resolve();
        // });
        // jest.spyOn(timeService, 'startChronometer').mockImplementation(() => {
        //     return new Subscription();
        // });
        // await gateway.joinRoomSolo(socket, playerName);
        expect(timeService.startChronometer).toHaveBeenCalled();
    });

    it('sendRoomName should emit sendRoomName with correct parameters', async () => {
        const roomName = 'test';
        // await gateway.sendRoomName(socket, roomName);
        expect(socket.emit.calledWith(ChatEvents.SendRoomName, match.array)).toBeTruthy();
    });

    it('sendRoomName should start the chronometer if room does not exist', async () => {
        const roomName = 'test';
        // jest.spyOn(timeService, 'startChronometer').mockImplementation(() => {
        //     return new Subscription();
        // });
        // await gateway.sendRoomName(socket, roomName);
        expect(timeService.startChronometer).toHaveBeenCalled();
    });

    it('leaveRoom() should call socketsLeave, call removeRoom() from playerService and disconnect', async () => {
        // jest.spyOn(playerService, 'removeRoom').mockImplementation(async () => {
        //     return Promise.resolve();
        // });
        const roomName = 'myRoom';
        gateway.roomName = roomName;
        stub(socket, 'rooms').value(new Set([roomName]));
        jest.spyOn(socket, 'to').mockReturnValue({
            socketsLeave: (event: string) => {
                expect(event).toEqual('myRoom');
            },
        } as BroadcastOperator<unknown, unknown>);
        await gateway.leaveRoom(socket);
        // expect(playerService.removeRoom).toHaveBeenCalled();
        expect(socket.disconnect.calledOnce).toBeTruthy();
    });

    it('sendRoomName should join room', async () => {
        const roomName = 'test';
        // await gateway.sendRoomName(socket, roomName);
        expect(socket.join.calledWith(roomName)).toBeTruthy();
    });

    it('startMultiGame should call addRoomMulti if playerQueue length == 2', async () => {
        // jest.spyOn(playerService, 'getRoomIndex').mockResolvedValue(INDEX_NOT_FOUND);
        // jest.spyOn(playerService, 'addRoomMulti').mockImplementation(async () => {
        //     return Promise.resolve();
        // });
        gateway.playersQueue = [testPlayer1, testPlayer2];
        const mockPlayer = {
            gameId: '89',
            creatorName: 'testCreator',
            gameName: 'gameTest',
            opponentName: 'hey',
        };
        await gateway.startMultiGame(socket, mockPlayer);
        // expect(playerService.addRoomMulti).toHaveBeenCalled();
    });
    it('gameEnded should call removeRoom(), socketsLeave and removeTimer', async () => {
        // jest.spyOn(playerService, 'removeRoom').mockImplementation(async () => {
        //     return Promise.resolve();
        // });
        jest.spyOn(timeService, 'removeTimer').mockImplementation(jest.fn());
        const roomName = 'myRoom';
        stub(socket, 'rooms').value(new Set([roomName]));
        jest.spyOn(socket, 'to').mockReturnValue({
            socketsLeave: (event: string) => {
                expect(event).toEqual('myRoom');
            },
        } as BroadcastOperator<unknown, unknown>);
        await gateway.gameEnded(socket, roomName);
        // expect(playerService.removeRoom).toHaveBeenCalled();
        expect(timeService.removeTimer).toHaveBeenCalled();
    });

    jest.useFakeTimers();
    it('emitTime() should emit the time', () => {
        // gateway.emitTime();
        timeService.elapsedTimes = new Map<string, number>([
            ['timer1', 0],
            ['timer2', 100],
            ['timer3', 200],
        ]);
        jest.advanceTimersByTime(1000);
        expect(server.emit.calledWith(ChatEvents.ServerTime, match.any)).toBeTruthy();
    });

    it('handleConnection should call logger.log()', () => {
        gateway.handleConnection(socket);
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('stopTimer() should call stopChronometer() with correct parameter and emit gameEnded', () => {
        const roomName = 'myRoom';
        stub(socket, 'rooms').value(new Set([roomName]));
        jest.spyOn(socket, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('gameEnded');
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(timeService, 'stopChronometer').mockImplementation(jest.fn());
        gateway.stopTimer(socket, ['timer1', 'myRoom']);
        expect(timeService.stopChronometer).toBeCalledWith('timer1');
    });

    it('stopTimer() should call removeTimer() with correct parameter', () => {
        const roomName = 'myRoom';
        stub(socket, 'rooms').value(new Set([roomName]));
        jest.spyOn(socket, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('gameEnded');
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(timeService, 'removeTimer').mockImplementation(jest.fn());
        gateway.stopTimer(socket, ['timer1', 'myRoom']);
        expect(timeService.removeTimer).toBeCalledWith('timer1');
    });

    it('message should emit message-return', () => {
        const myArray: [string, string, string, string, string, boolean] = ['hello', 'world', 'foo', 'bar', 'baz', true];
        jest.spyOn(socket, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('message-return');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.message(socket, myArray);
    });

    it('findDifference should emit findDifference-return', () => {
        const infos = {
            playerName: 'myPlayer',
            roomName: 'myRoom',
        };
        jest.spyOn(socket, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('findDifference-return');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.findDifference(socket, infos);
    });

    it('differenceFound should emit feedbackDifference', () => {
        const infos = [[], 'myRoom'];
        jest.spyOn(socket, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('feedbackDifference');
            },
        } as BroadcastOperator<unknown, unknown>);
        // gateway.differenceFound(socket, infos);
    });

    it('sendGiveUp should emit giveup-return', () => {
        const infos = {
            playerName: 'myPlayer',
            roomName: 'myRoom',
        };
        jest.spyOn(socket, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('giveup-return');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.sendGiveUp(socket, infos);
    });

    // it('playersMatch() should return an empty array if there are no matching players', () => {
    //     // gateway.playersQueue = [testPlayer1, testPlayer3];
    //     // const match1 = gateway.playersMatch();
    //     // expect(match1.length).toBe(0);
    // });

    // it('playersMatch() should return an array with two players if there is a match in the queue', () => {
    //     // gateway.playersQueue = [testPlayer1, testPlayer2];
    //     // const match2 = gateway.playersMatch();
    //     // expect(match2.length).toBe(2);
    // });

    // it('playersMatch() should remove the matching players from the queue', () => {
    //     // gateway.playersQueue = [testPlayer1, testPlayer2];
    //     // gateway.playersMatch();
    //     // expect(gateway.playersQueue.length).toBe(0);
    // });

    // it('removePlayerFromQueue() should remove the player from the queue', () => {
    //     gateway.playersQueue = [testPlayer1];
    //     gateway.removePlayerFromQueue(testPlayer1);
    //     expect(gateway.playersQueue.length).toBe(0);
    // });
});
