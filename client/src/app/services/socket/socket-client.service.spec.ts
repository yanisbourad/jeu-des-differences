import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketClient } from '@app/utils/socket-client';
import { SocketTestHelper } from '@app/utils/socket-helper';
import { Socket } from 'socket.io-client';
import { SocketClientService } from './socket-client.service';

import SpyObj = jasmine.SpyObj;
import { Game } from '@common/game';

describe('SocketClientService', () => {
    let service: SocketClientService;
    let socketClient: SpyObj<SocketClient>;
    const mockGame: Game = {
        gameName: 'test',
        difficulty: 'test',
        originalImageData: 'test',
        modifiedImageData: 'test',
        listDifferences: ['test'],
    };

    beforeEach(async () => {
        socketClient = jasmine.createSpyObj('SocketClient', ['isSocketAlive', 'connect', 'on', 'emit', 'send', 'disconnect']);
        TestBed.configureTestingModule({
            imports: [MatDialogModule, BrowserAnimationsModule, RouterTestingModule], // add MatDialogModule here
            providers: [{ provide: SocketClient, useValue: socketClient }],
        });
        service = TestBed.inject(SocketClientService);
        socketClient.socket = new SocketTestHelper() as unknown as Socket;
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any, complexity
        socketClient.on.and.callFake((event: string, callback: (data: any) => void) => {
            if (event === 'hello') {
                callback('socketId');
            }

            if (event === 'nbrDifference') {
                callback(1);
            }

            if (event === 'nbrDiffLeft') {
                callback(1);
            }

            if (event === 'diffFound') {
                callback(new Set([1, 2, 3]));
            }

            if (event === 'error') {
                callback(new Set([]));
            }

            if (event === 'connect') {
                callback('');
            }

            if (event === 'teammateDisconnected') {
                callback(true);
            }

            if (event === 'timeLimitStatus') {
                callback(true);
            }
            if (event === 'getRandomGame') {
                callback(mockGame);
            }

            if (event === 'serverTime') {
                callback(new Map([['apple', 3]]));
            }

            if (event === 'sendRoomName') {
                callback(['multi', 'string']);
            }

            if (event === 'message-return') {
                callback({ message: 'string', userName: 'string', color: 'string', pos: 'string', event: true });
            }
            if (event === 'gameEnded') {
                callback([true, 'string']);
            }
            if (event === 'findDifference-return') {
                callback({ playerName: 'string' });
            }
            if (event === 'feedbackDifference') {
                const diff = new Set([1, 2, 3]);
                callback(diff);
            }
            if (event === 'giveup-return') {
                callback({ playerName: 'string' });
            }
        });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return socketId if socket exist', () => {
        const socketId = 'socketId';
        socketClient.socket.id = socketId;
        expect(service.socketId).toEqual(socketId);
    });

    it('should return empty string if socket does not exist', () => {
        socketClient.socket.id = '';
        expect(service.socketId).toEqual('');
    });

    it('should set gameTime by setting elapsedTimes', () => {
        service.elapsedTimes = new Map<string, number>();
        const expectedTime = 5;
        service.roomName = 'test';
        service.elapsedTimes.set('test', 2);
        service.gameTime = expectedTime;
        expect(service.elapsedTimes.get('test')).toEqual(expectedTime);
    });

    it('should return the game', () => {
        service.game = mockGame;
        const result: Game = service.getGame();
        expect(result).toEqual(mockGame);
    });

    it('should return roomTime if roomTime exist', () => {
        service.elapsedTimes = new Map([['apple', 3]]);
        expect(service.getRoomTime('apple')).toEqual(3);
    });

    it('should not connect to the socket if the socket is connected', () => {
        socketClient.isSocketAlive.and.returnValue(true);
        expect(socketClient.connect).not.toHaveBeenCalled();
    });

    it('should call configureBaseSocketFeatures if the socket is not connected', () => {
        socketClient.isSocketAlive.and.returnValue(false);
        spyOn(service, 'configureBaseSocketFeatures');
        service.connect();
        expect(service.configureBaseSocketFeatures).toHaveBeenCalled();
    });

    it('connectionHandling should set up all connection event listener on the socket client', () => {
        service.connectionHandling();
        expect(socketClient.on).toHaveBeenCalledWith('connect', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('hello', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('sendRoomName', jasmine.any(Function));
    });

    it('differenceHandling should set up all difference event listener on the socket client', () => {
        service.differenceHandling();
        expect(socketClient.on).toHaveBeenCalledWith('nbrDifference', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('nbrDiffLeft', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('diffFound', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('error', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('findDifference-return', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('feedbackDifference', jasmine.any(Function));
    });

    it('timeLimitHandling should set up all timeLimit event listener on the socket client', () => {
        service.timeLimitHandling();
        expect(socketClient.on).toHaveBeenCalledWith('timeLimitStatus', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('teammateDisconnected', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('getRandomGame', jasmine.any(Function));
    });

    it('timeAndMessageHandling should set up all timeAndMessage event listener on the socket client', () => {
        service.timeAndMessageHandling();
        expect(socketClient.on).toHaveBeenCalledWith('serverTime', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('message-return', jasmine.any(Function));
    });

    it('endGameHandling should set up all endGame event listener on the socket client', () => {
        service.endGameHandling();
        expect(socketClient.on).toHaveBeenCalledWith('gameEnded', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('giveup-return', jasmine.any(Function));
    });

    it('should call connectionHandling, differenceHandling, timeLimitHandling, timeAndMessageHandling and endGameHandling()', () => {
        spyOn(service, 'connectionHandling');
        spyOn(service, 'differenceHandling');
        spyOn(service, 'timeLimitHandling');
        spyOn(service, 'timeAndMessageHandling');
        spyOn(service, 'endGameHandling');
        service.configureBaseSocketFeatures();
        expect(service.connectionHandling).toHaveBeenCalled();
        expect(service.differenceHandling).toHaveBeenCalled();
        expect(service.timeLimitHandling).toHaveBeenCalled();
        expect(service.timeAndMessageHandling).toHaveBeenCalled();
        expect(service.endGameHandling).toHaveBeenCalled();
    });

    it('should send a joinRoomSolo message to the socket when joining a room', () => {
        const gameName = 'game1';
        const playerName = 'testPlayer';
        service.joinRoomSolo(playerName, gameName);
        expect(socketClient.send).toHaveBeenCalledWith('joinRoomSolo', { playerName, gameName });
    });

    it('should send a startTimeLimit message to the socket when joining timeLimit game', () => {
        const playerName = 'testPlayer';
        service.startTimeLimit(playerName);
        expect(socketClient.send).toHaveBeenCalledWith('startTimeLimit', playerName);
    });

    it('should send sendRoomName with correct parameters', () => {
        const roomName = 'roomName';
        const mode = 'test';
        service.sendRoomName(roomName, mode);
        expect(socketClient.send).toHaveBeenCalledWith('sendRoomName', { roomName, mode });
    });

    it('should send startMultiTimeLimit with correct parameters', () => {
        const game = { gameId: 0, creatorName: 'string', gameName: 'string', opponentName: 'string', mode: 'string' };
        service.startMultiTimeLimit(game);
        expect(socketClient.send).toHaveBeenCalledWith('startMultiTimeLimit', game);
    });

    it('should return a roomName', () => {
        const roomName = 'roomName';
        service.roomName = roomName;
        expect(service.getRoomName()).toEqual(roomName);
    });

    it('disconnect should call disconnect and empty messageList', () => {
        service.messageList = [{ message: 'string', playerName: 'string', mine: true, color: '#fff', pos: 'string', event: true }];
        service.disconnect();
        expect(service.messageList).toEqual([]);
        expect(socketClient.disconnect).toHaveBeenCalled();
    });

    it('leaveRoom should emit leaveRoom and call disconnect', () => {
        spyOn(service, 'disconnect');
        service.leaveRoom();
        expect(service.disconnect).toHaveBeenCalled();
        expect(socketClient.send).toHaveBeenCalledWith('leaveRoom');
    });

    it('findDifference should emit findDifference with correct parameters', () => {
        service.findDifference({ playerName: 'string', roomName: 'string' });
        expect(socketClient.send).toHaveBeenCalledWith('findDifference', { playerName: 'string', roomName: 'string' });
    });

    it('sendMessage should emit sendMessage with correct parameters', () => {
        service.sendMessage({ message: 'string', playerName: 'string', color: 'string', pos: 'string', gameId: 'string', event: true });
        expect(socketClient.send).toHaveBeenCalled();
        expect(socketClient.send).toHaveBeenCalledWith('message', ['string', 'string', 'string', 'string', 'string', true]);
    });

    it('sendGiveUp should emit sendGiveUp with correct parameters', () => {
        service.sendGiveUp({ playerName: 'string', roomName: 'string' });
        expect(socketClient.send).toHaveBeenCalledWith('sendGiveUp', { playerName: 'string', roomName: 'string' });
    });

    it('sendDifference should emit feedbackDifference with correct parameters', () => {
        const numbers: Set<number> = new Set([1, 2, 3]);
        service.sendDifference(numbers, 'string');
        expect(socketClient.send).toHaveBeenCalledWith('feedbackDifference', [[1, 2, 3], 'string']);
    });

    it('should emit startMultiGame with correct parameters', () => {
        const game = { gameId: 0, creatorName: 'string', gameName: 'string', opponentName: 'string', mode: 'string' };
        const player = { gameId: 0, creatorName: 'string', gameName: 'string', opponentName: 'string' };
        service.startMultiGame(game);
        expect(socketClient.send).toHaveBeenCalledWith('startMultiGame', player);
    });

    it('should emit gameEnded with correct parameter', () => {
        service.gameEnded('string');
        expect(socketClient.send).toHaveBeenCalledWith('gameEnded', 'string');
    });

    it('should emit stopTimer with correct parameters', () => {
        service.stopTimer('blabla', 'GFDG');
        expect(socketClient.send).toHaveBeenCalledWith('stopTimer', ['blabla', 'GFDG']);
    });

    it('should get roomTime', () => {
        service.elapsedTimes = new Map<string, number>();
        service.roomName = 'test';
        service.elapsedTimes.set('test', 2);
        const result = service.getRoomTime('test');
        expect(result).toEqual(2);
    });

    it('should send sendMousePosition by emitting mousePosition with correct parameters ', () => {
        service.sendMousePosition(1, 'test', 'test');
        expect(socketClient.send).toHaveBeenCalledWith('mousePosition', [1, 'test', 'test']);
    });

    it('should send modifyTime with correct parameters ', () => {
        service.modifyTime('test');
        expect(socketClient.send).toHaveBeenCalledWith('modifyTime', 'test');
    });
});
