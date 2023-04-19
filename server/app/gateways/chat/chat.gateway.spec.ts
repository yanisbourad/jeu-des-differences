import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { ServerTimeService } from '@app/services/time/server-time.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Subscription } from 'rxjs';
import { createStubInstance, match, SinonStubbedInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { ChatEvents } from './chat.gateway.events';
import { GameService } from '@app/services/game/game.service';
import { Game } from '@common/game';

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
    const mockGame: Game= {
        gameName: 'test',
        difficulty: 'test',
        originalImageData: 'test',
        modifiedImageData: 'test',
        listDifferences: ['test'],
    }

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
        gateway.games = new Map<string, Game>();
        gameService.games = new Map<string, Game>();
        gateway.game = mockGame;
        gameService.gamesNames = [];
        timeService.timeConstants = {timeBonus: 5, timeInit: 30, timePen: 5};
        gameService.games.set('test', mockGame);
        gameService.gamesNames.push('test');
        jest.spyOn(gameService, 'getGame').mockReturnValue( await Promise.resolve(mockGame));
        jest.spyOn(gameService, 'getGames').mockReturnValue( await Promise.resolve( new Map<string, Game>([['test', mockGame]])));
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

    it('handleDisconnect should be logged  and leave room', () => {
        gateway.handleDisconnect(socket);
        expect(logger.log.calledOnce).toBeTruthy();
        expect(socket.leave.calledOnce).toBeTruthy();
    });

    it('handleDisconnect should emit giveup-return', async () => {
        gateway.isMulti = true;
        gateway.isPlaying.set('test', true);
        gateway.isTimeLimit.set('test', false);
        gateway.roomName = 'test';    
        stub(socket, 'rooms').value(new Set(['test']));
        jest.spyOn(socket, 'to').mockReturnValue({ emit: (event: string) => { expect(event).toEqual('giveup-return')}} as BroadcastOperator<unknown, unknown>);
        gateway.handleDisconnect(socket);
    });

    it('handleDisconnect should emit teammateDisconnected', async () => {
        gateway.isMulti = true;
        gateway.roomName = 'test';
        gateway.isPlaying.set('test', true);
        gateway.isTimeLimit.set('test', true);
        gateway.playerName = 'test';
        stub(socket, 'rooms').value(new Set(['test']));
        jest.spyOn(socket, 'to').mockReturnValue({ emit: (event: string) => { expect(event).toEqual('teammateDisconnected')}} as BroadcastOperator<unknown, unknown>);
        gateway.handleDisconnect(socket);     
    });

    jest.useFakeTimers(); 
    it('afterInit() should emit timeLimitStatus and call removeTimer if countDown <= 0 then trigger emit serverTime with correct parameters ', () => {
        gateway.roomName = 'myRoom';
        timeService.countDown = 0;
        stub(socket, 'rooms').value(new Set(['myRoom']));
        jest.spyOn(server, 'to').mockReturnValue({ emit: (event: string) => { expect(event).toEqual('timeLimitStatus')}} as BroadcastOperator<unknown, unknown>);
        jest.spyOn(timeService, 'removeTimer').mockImplementation(jest.fn());
        gateway.afterInit();
        timeService.elapsedTimes = new Map<string, number>([['timer1', 0],['timer2', 100],['timer3', 200]]);
        jest.advanceTimersByTime(1000);
        expect(timeService.removeTimer).toBeCalledWith('myRoom');
        expect(server.emit.calledWith(ChatEvents.ServerTime, match.any)).toBeTruthy();
    });

    it('joinRoomSolo() should join the socket room, set isPlaying to true, start the timer and emit hello', async () => {
        const playerName = 'John Doe';
        const gameName = 'test'
        jest.spyOn(timeService, 'startChronometer').mockImplementation(jest.fn());
        await gateway.joinRoomSolo(socket, {playerName, gameName });
        expect(gateway.isPlaying.get(socket.id)).toBe(true);
        expect(socket.join.calledOnce).toBeTruthy();
        expect(timeService.startChronometer).toHaveBeenCalled();
        expect(socket.emit.calledWith(ChatEvents.Hello, match.string)).toBeTruthy();
    });
    
    it('startTimeLimit() should set isPlaying and isTimeLimit to true, start the timer, getRandomGame and nbrDifference ', async () => {
        const playerName = 'John Doe';
        const mockSocket = { id: 'test', join: jest.fn(), emit: jest.fn(), to: jest.fn(), rooms: new Set([]) } as any;
        gateway.isPlaying.set(mockSocket.id, false);
        gateway.isTimeLimit.set(mockSocket.id, false);
        jest.spyOn(gateway.server, 'to').mockReturnValue({ emit: jest.fn()} as any);
        jest.spyOn(timeService, 'startCountDown').mockImplementation(jest.fn());
        await gateway.startTimeLimit(mockSocket, playerName);
        expect(gateway.isPlaying.get(mockSocket.id)).toBe(true);
        expect(gateway.isTimeLimit.get(mockSocket.id)).toBe(true);
        expect(timeService.startCountDown).toHaveBeenCalled();
        expect(server.to(mockSocket.id).emit).toHaveBeenCalledWith('getRandomGame', mockGame);
        expect(server.to(mockSocket.id).emit).toHaveBeenCalledWith('nbrDifference', mockGame.listDifferences.length);
    });

    it('startTimeLimit() should join the socket room and emit hello ', async () => {
        const playerName = 'John Doe';
        jest.spyOn(gateway.server, 'to').mockReturnValue({ emit: jest.fn()} as any);
        stub(socket, 'rooms').value(new Set(['test']));
        await gateway.startTimeLimit(socket, playerName);
        expect(socket.emit.calledWith(ChatEvents.Hello, match.string)).toBeTruthy();
        expect(socket.join.calledOnce).toBe(true);
    });

    it('sendRoomName should emit sendRoomName with correct parameters', async () => {
        const data = { roomName: 'test', mode: ''};
        await gateway.sendRoomName(socket, data);
        expect(socket.emit.calledWith(ChatEvents.SendRoomName, match.array)).toBeTruthy();
    });

    it('sendRoomName should start timer and emit getRandomGame and nbrDifference with correct parameters', async () => {
        const data = { roomName: 'test', mode: 'tempsLimite'};
        const mockSocket = { id: 'test', join: jest.fn(), emit: jest.fn(), to: jest.fn(), rooms: new Set([]) } as any;
        jest.spyOn(mockSocket, 'to').mockReturnValue({ emit: jest.fn()} as any);
        jest.spyOn(timeService, 'startCountDown').mockImplementation(jest.fn());
        await gateway.sendRoomName(mockSocket, data);
        expect(mockSocket.to(mockSocket.id).emit).toHaveBeenCalledWith('getRandomGame', mockGame);
        expect(mockSocket.to(mockSocket.id).emit).toHaveBeenCalledWith('nbrDifference', 0);
        expect(timeService.startCountDown).toHaveBeenCalled();

    });

    it('leaveRoom() should call socketsLeave, call removeRoom() from playerService and disconnect', async () => {
        gateway.roomName = 'myRoom';
        stub(socket, 'rooms').value(new Set(['myRoom']));
        jest.spyOn(socket, 'to').mockReturnValue({ socketsLeave: (event: string) => { expect(event).toEqual('myRoom')}} as BroadcastOperator<unknown, unknown>);
        await gateway.leaveRoom(socket);
        expect(socket.disconnect.calledOnce).toBeTruthy();
    });

    it('startMultiGame should set isMulti to true if playerQueue length == 2', async () => {
        gateway.isMulti = false;
        gateway.playersQueue = [testPlayer1, testPlayer2];
        const mockPlayer = { gameId: '89', creatorName: 'testCreator', gameName: 'gameTest', opponentName: 'hey' };
        await gateway.startMultiGame(socket, mockPlayer);
        expect(gateway.isMulti).toBe(true);
    });
    it('startMultiGame should set not isMulti to true if playerQueue length == 0', async () => {
        gateway.isMulti = false;
        gateway.playersQueue = [];
        const mockPlayer = { gameId: '89', creatorName: 'testCreator', gameName: 'gameTest', opponentName: 'hey' };
        await gateway.startMultiGame(socket, mockPlayer);
        expect(gateway.isMulti).toBe(false);
    });

    it('startMultiTimeLimit should set isMulti, isPlaying and isTimeLimit to true to true if playerQueue length == 2', async () => {
        gateway.isMulti = false;
        gateway.playersQueue = [testPlayer1, testPlayer2];
        const mockPlayer = { gameId: '89', creatorName: 'testCreator', gameName: 'gameTest', opponentName: 'hey', mode: 'tempsLimite'};
        const roomName = mockPlayer.gameId + mockPlayer.gameName;
        gateway.isPlaying.set(roomName, false);
        gateway.isTimeLimit.set(roomName, false);
        await gateway.startMultiTimeLimit(socket, mockPlayer);
        expect(gateway.isMulti).toBe(true);
        expect(gateway.isPlaying.get(roomName)).toBe(true);
        expect(gateway.isTimeLimit.get(roomName)).toBe(true);
    });

    it('gameEnded should call disconnect(), removeTimer and set isPlaying ans isTimeLimit to false', async () => {
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

    it('stopTimer() should call stopChronometer() with correct parameter, emit gameEnded, call removeTimer and disconnect', () => {
        gateway.isMulti = true;
        stub(socket, 'rooms').value(new Set(['myRoom']));
        jest.spyOn(socket, 'to').mockReturnValue({ emit: (event: string) => { expect(event).toEqual('gameEnded')}} as BroadcastOperator<unknown, unknown>);
        jest.spyOn(timeService, 'stopChronometer').mockImplementation(jest.fn());
        jest.spyOn(timeService, 'removeTimer').mockImplementation(jest.fn());
        gateway.stopTimer(socket, ['timer1', 'myRoom']);
        expect(timeService.stopChronometer).toBeCalledWith('timer1');
        expect(timeService.removeTimer).toBeCalledWith('timer1');
        expect(socket.disconnect.calledOnce).toBeTruthy();
        expect(gateway.isMulti).toBe(false);
    });

    it('message should emit message-return', () => {
        const myArray: [string, string, string, string, string, boolean] = ['hello', 'world', 'foo', 'bar', 'baz', true];
        jest.spyOn(socket, 'to').mockReturnValue({ emit: (event: string) => { expect(event).toEqual('message-return')},
        } as BroadcastOperator<unknown, unknown>);
        gateway.message(socket, myArray);
    });

    it('should broadcast message to all clients except sender when second element is "meilleur temps"', () => {
        const data: [string, string, string, string, string, boolean] = ['Hello', 'meilleur temps', 'red', 'top', 'room1', true];
        const expectedMessage = { message: 'Hello', userName: 'meilleur temps', color: 'red', pos: 'top', event: true };
        const customSocket = {broadcast: { emit: (event: string) => { expect(event).toEqual('message-return') }}} as Socket;
        jest.spyOn(customSocket.broadcast, 'emit').mockImplementation(jest.fn().mockReturnValue(true));
        gateway.message(customSocket, data);
        expect(customSocket.broadcast.emit).toHaveBeenCalledWith('message-return', expectedMessage);
    });

    it('sendGiveUp should emit giveup-return', () => {
        const infos = { playerName: 'myPlayer', roomName: 'myRoom'};
        jest.spyOn(socket, 'to').mockReturnValue({ emit: (event: string) => { expect(event).toEqual('giveup-return')}} as BroadcastOperator<unknown, unknown>);
        gateway.sendGiveUp(socket, infos);
    });

    it('findDifference() emit findDifference-return', () => {
        const infos = { playerName: 'myPlayer', roomName: 'myRoom' };
        gateway.playerName = infos.playerName;
        jest.spyOn(socket, 'to').mockReturnValue({ emit: (event: string) => { expect(event).toEqual('findDifference-return')}} as BroadcastOperator<unknown, unknown>);
        gateway.findDifference(socket, infos);
    });

    it('differenceFound() should emit feedbackDifference', () => {
        const data: [Array<number>, string]= [[1,2,3], 'myRoom'];
        jest.spyOn(socket, 'to').mockReturnValue({ emit: (event: string) => { expect(event).toEqual('feedbackDifference')}} as BroadcastOperator<unknown, unknown>);
        gateway.differenceFound(socket, data);
    });

    it('modifyTime() should call decrementTime from serverTime service if gameMode is tempsLimite', () => {
        gateway.roomName = 'test';
        jest.spyOn(timeService, 'decrementTime').mockImplementationOnce(jest.fn());
        gateway.modifyTime(socket, 'tempsLimite');
        expect(timeService.decrementTime).toHaveBeenCalledWith(gateway.roomName);
    });

    it('modifyTime() should increment count from serverTime service if gameMode is not tempsLimite', () => {
        gateway.roomName = 'test';
        timeService.count.set(socket.id, 3);
        gateway.modifyTime(socket, '');
        expect(timeService.count.get(socket.id)).toEqual(timeService.count.get(socket.id) + timeService.timeConstants.timeBonus);
    });

    it('mouseDetect() should emit diff found and call goToNext game in timeLimit mode', () => {
        const data: [number, string, string]= [1, 'myRoom', 'tempsLimite'];
        gateway.mouseDetect(socket, data);
        expect(socket.to).toHaveBeenCalledWith(data[1]);
    });
});
