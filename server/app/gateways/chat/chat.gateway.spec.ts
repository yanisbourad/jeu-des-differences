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
        timeService.timers = { timer1: new Subscription(), timer2: new Subscription(), timer3: new Subscription() };
        timeService.count = new Map<string, number>();
        timeService.timeConstants = {timeBonus: 5, timeInit: 30, timePen: 5};
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('connect() should call the logger.log method', () => { //ok
        gateway.connect(socket);
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('socket handleConnection should be logged', () => { //ok
        gateway.handleConnection(socket);
        expect(logger.log.calledOnce).toBeTruthy();
    });

    it('handleDisconnect should be logged  and leave room', () => { // ok
        gateway.handleDisconnect(socket);
        expect(logger.log.calledOnce).toBeTruthy();
        expect(socket.leave.calledOnce).toBeTruthy();
    });

    it('handleDisconnect should emit giveup-return', async () => { // ok
        gateway.isMulti = true;
        gateway.isPlaying.set('test', true);
        gateway.isTimeLimit.set('test', false);
        gateway.roomName = 'test';    
        stub(socket, 'rooms').value(new Set(['test']));
        jest.spyOn(socket, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('giveup-return');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.handleDisconnect(socket);
    });

    it('handleDisconnect should emit teammateDisconnected', async () => { // ok
        gateway.isMulti = true;
        gateway.roomName = 'test';
        gateway.isPlaying.set('test', true);
        gateway.isTimeLimit.set('test', true);
        gateway.playerName = 'test';
        stub(socket, 'rooms').value(new Set(['test']));
        jest.spyOn(socket, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('teammateDisconnected');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.handleDisconnect(socket);     
    });
    jest.useFakeTimers();
    // it('afterInit() should trigger emit serverTime with correct parameters ', () => {
    //     gateway.afterInit();
    //     timeService.elapsedTimes = new Map<string, number>([['timer1', 0],['timer2', 100],['timer3', 200]]);
    //     jest.advanceTimersByTime(1000);
    //     expect(server.emit.calledWith(ChatEvents.ServerTime, match.any)).toBeTruthy();
    // });
    it('afterInit() should emit timeLimitStatus and call removeTimer if countDown <= 0 then trigger emit serverTime with correct parameters ', () => {
        const roomName = 'myRoom';
        gateway.roomName = roomName;
        timeService.countDown = 0;
        stub(socket, 'rooms').value(new Set([roomName]));
        jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('timeLimitStatus');
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(timeService, 'removeTimer').mockImplementation(jest.fn());
        gateway.afterInit();
        timeService.elapsedTimes = new Map<string, number>([['timer1', 0],['timer2', 100],['timer3', 200]]);
        jest.advanceTimersByTime(1000);
        expect(timeService.removeTimer).toBeCalledWith(roomName);
        expect(server.emit.calledWith(ChatEvents.ServerTime, match.any)).toBeTruthy();
    });
    /**etInterval(() => {
            Iif (this.serverTime.countDown <= 0) {
                this.server.to(this.roomName).emit('timeLimitStatus', false);
                this.serverTime.removeTimer(this.roomName);
            } */

    it('joinRoomSolo() should join the socket room and set isPlaying to true', async () => {
        expect(gateway.isPlaying.get(socket.id)).toBe(true);
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

    it('gameEnded should call disconnect(), removeTimer and set isPlaying ans isTimeLimit to false', async () => { //ok
        jest.spyOn(timeService, 'removeTimer').mockImplementation(jest.fn());
        const roomName = 'myRoom';
        gateway.isPlaying.set(roomName, true);
        gateway.isTimeLimit.set(gateway.roomName, true);
        await gateway.gameEnded(socket, roomName);
        expect(timeService.removeTimer).toHaveBeenCalled();
        expect(socket.disconnect.calledOnce).toBeTruthy();
        expect(gateway.isPlaying.get(roomName)).toBe(false);
        expect(gateway.isTimeLimit.get(gateway.roomName)).toBe(false);
    });

    // jest.useFakeTimers();
    // it('emitTime() should emit the time', () => {
    //     // gateway.emitTime();
    //     timeService.elapsedTimes = new Map<string, number>([
    //         ['timer1', 0],
    //         ['timer2', 100],
    //         ['timer3', 200],
    //     ]);
    //     jest.advanceTimersByTime(1000);
    //     expect(server.emit.calledWith(ChatEvents.ServerTime, match.any)).toBeTruthy();
    // });

    it('stopTimer() should call stopChronometer() with correct parameter, emit gameEnded, call removeTimer and disconnect', () => {
        const roomName = 'myRoom';
        gateway.isMulti = true;
        stub(socket, 'rooms').value(new Set([roomName]));
        jest.spyOn(socket, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('gameEnded');
            },
        } as BroadcastOperator<unknown, unknown>);
        jest.spyOn(timeService, 'stopChronometer').mockImplementation(jest.fn());
        jest.spyOn(timeService, 'removeTimer').mockImplementation(jest.fn());
        gateway.stopTimer(socket, ['timer1', 'myRoom']);
        expect(timeService.stopChronometer).toBeCalledWith('timer1');
        expect(timeService.removeTimer).toBeCalledWith('timer1');
        expect(socket.disconnect.calledOnce).toBeTruthy();
        expect(gateway.isMulti).toBe(false);
    });

    // it('stopTimer() should call removeTimer() with correct parameter', () => {
    //     const roomName = 'myRoom';
    //     stub(socket, 'rooms').value(new Set([roomName]));
    //     jest.spyOn(socket, 'to').mockReturnValue({
    //         emit: (event: string) => {
    //             expect(event).toEqual('gameEnded');
    //         },
    //     } as BroadcastOperator<unknown, unknown>);
    //     jest.spyOn(timeService, 'removeTimer').mockImplementation(jest.fn());
    //     gateway.stopTimer(socket, ['timer1', 'myRoom']);
    //     expect(timeService.removeTimer).toBeCalledWith('timer1');
    // });

    it('message should emit message-return', () => {
        const myArray: [string, string, string, string, string, boolean] = ['hello', 'world', 'foo', 'bar', 'baz', true];
        jest.spyOn(socket, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('message-return');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.message(socket, myArray);
    });

    // it('message should broadcast message-return', () => {
    //     // const broadcastSpy = jest.spyOn(socket, 'broadcast').mockImplementation(() => ({
    //     //     emit: jest.fn(),
    //     //   }));
    //     const myArray: [string, string, string, string, string, boolean] = ['hello', 'meilleur temps', 'foo', 'bar', 'baz', true];
    //     expect(socket.broadcast.emit).toHaveBeenCalledWith('message-return', { message: 'Hello', userName: 'meilleur temps', color: 'red', pos: '1', event: true });
    //     gateway.message(socket, myArray);
   
    // });

    it('should broadcast message to all clients except sender when second element is "meilleur temps"', () => { // doesn't work
        const data: [string, string, string, string, string, boolean] = ['Hello', 'meilleur temps', 'red', 'top', 'room1', true];
        const expectedMessage = { message: 'Hello', userName: 'meilleur temps', color: 'red', pos: 'top', event: true };
        jest.spyOn(socket.broadcast, 'emit').mockImplementation(jest.fn().mockReturnValue(true));
        gateway.message(socket, data);
        expect(socket.broadcast.emit).toHaveBeenCalledWith('message-return', expectedMessage);
    });

    it('sendGiveUp should emit giveup-return', () => { // to verify
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

    it('findDifference() emit findDifference-return', () => { // to verify
        const infos = { playerName: 'myPlayer', roomName: 'myRoom' };
        gateway.playerName = infos.playerName;
        jest.spyOn(socket, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('findDifference-return');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.findDifference(socket, infos);
    });


    it('differenceFound() should emit feedbackDifference', () => { // to verify
        const data: [Array<number>, string]= [[1,2,3], 'myRoom'];
        jest.spyOn(socket, 'to').mockReturnValue({
            emit: (event: string) => {
                expect(event).toEqual('feedbackDifference');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.differenceFound(socket, data);

    });

    it('modifyTime() should call decrementTime from serverTime service if gameMode is tempsLimite', () => {
        gateway.roomName = 'test';
        const gameMode = 'tempsLimite';
        jest.spyOn(timeService, 'decrementTime').mockImplementation(jest.fn());
        gateway.modifyTime(socket, gameMode);
        expect(timeService.decrementTime).toHaveBeenCalledWith(gateway.roomName);
    });

    it('modifyTime() should increment count from serverTime service if gameMode is not tempsLimite', () => { // to verify
        gateway.roomName = 'test';
        const gameMode = '';
        timeService.count.set(socket.id, 3);
        const expectedTime = timeService.count.get(socket.id) + timeService.timeConstants.timeBonus;
        gateway.modifyTime(socket, gameMode);
        expect(timeService.count.get(socket.id)).toEqual(expectedTime);
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
