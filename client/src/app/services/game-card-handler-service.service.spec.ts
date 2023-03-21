import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketClient } from '@app/utils/socket-client';
import { SocketTestHelper } from '@app/utils/socket-helper';
import { Socket } from 'socket.io-client';
import { GameCardHandlerService } from './game-card-handler-service.service';
import SpyObj = jasmine.SpyObj;

describe('GameCardHandlerService', () => {
    let service: GameCardHandlerService;
    let socketSpy: SpyObj<Socket>;
    let socketClient: SpyObj<SocketClient>;
    // let socketClientServiceSpy: SpyObj<SocketClientService>;
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    beforeEach(() => {
        socketClient = jasmine.createSpyObj('SocketClient', ['isSocketAlive', 'connect', 'on', 'emit', 'send', 'disconnect']);
        socketSpy = jasmine.createSpyObj('Socket', ['on', 'emit', 'disconnect', 'connect']);
        // socketClientServiceSpy = jasmine.createSpyObj('SocketClientService', ['connect']);
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: Router,
                    useValue: routerSpy,
                },
                { provide: SocketClient, useValue: socketClient },
            ],
            imports: [MatDialogModule],
        });
        service = TestBed.inject(GameCardHandlerService);
        // service.socket = new SocketTestHelper() as unknown as Socket;
        service.games.set('test', 1);
        service.games.set('toaster', 0);
        service.games.set('dad', 0);
        service.socket = socketSpy;
        socketClient.socket = new SocketTestHelper() as unknown as Socket;
        // socketClient.on.and.callFake((event: string, callback: (data: unknown) => void) => {
        //     if (event === 'hello') {
        //         callback('Hello, world!');
        //     }
        //     if (event === 'message') {
        //         callback('message');
        //     }
        //     if (event === 'connect') {
        //         callback('connect');
        //     }

        //     if (event === 'serverTime') {
        //         callback(new Map([['apple', 3]]));
        //     }

        //     if (event === 'sendRoomName') {
        //         callback(['multi', 'string']);
        //     }
        //     if (event === 'message-return') {
        //         callback({ message: 'string', userName: 'string', color: 'string', pos: 'string', event: true });
        //     }
        //     if (event === 'gameEnded') {
        //         callback([true, 'string']);
        //     }
        //     if (event === 'findDifference-return') {
        //         callback({ playerName: 'string' });
        //     }
        //     if (event === 'feedbackDifference') {
        //         const diff = new Set([1, 2, 3]);
        //         callback(diff);
        //     }
        //     if (event === 'giveup-return') {
        //         callback({ playerName: 'string' });
        //     }
        // });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('should return game state as function being called', () => {
        expect(service.getGameState()).toBe('');
    });
    it('should return if player is the game creator as function being called', () => {
        expect(service.getCreatorStatus()).toBeFalsy();
    });
    it('should return readiness state of the game function being called', () => {
        expect(service.getReadinessStatus()).toBe(false);
    });
    it('should return rejection state of the game function being called', () => {
        expect(service.getRejectionStatus()).toBe(false);
    });

    it('should return creer with value 0 for corresponding game name', () => {
        expect(service.toggleCreateJoin('toaster')).toEqual('Créer');
    });
    it('should return creer when game name is not a key', () => {
        expect(service.toggleCreateJoin('motion')).toEqual('Créer');
    });
    it('should return joindre with value 1 for corresponding game name', () => {
        expect(service.toggleCreateJoin('test')).toEqual('Joindre');
    });

    // test for connect function mocking io
    it('should connect client to the server using websocket', () => {
        service.connect();
        expect(service.socket).toBeTruthy();
    });

    it('configureBaseSocketFeatures should set up all event listener on the socket client', () => {
        service.listenToFeedBack();
        expect(socketClient.on).toHaveBeenCalledWith('connect', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('hello', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('serverTime', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('sendRoomName', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('message-return', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('gameEnded', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('findDifference-return', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('feedbackDifference', jasmine.any(Function));
        // expect(socketClient.on).toHaveBeenCalledWith('giveup-return', jasmine.any(Function));
    });

    // // test for updateGameStatus
    // it('should call emit findAllGamesStatus when updating game status', () => {
    //     const gameNames = ['test', 'toaster', 'dad'];
    //     service.connect();
    //     service.updateGameStatus(gameNames);
    //     expect(socketSpy.on).toHaveBeenCalled();
    // });

    // test for get new update
    it('should return true if there is a new update', () => {
        expect(service.getNewUpdate()).toBeFalsy();
    });

    // test for set new update
    it('should set isNewUpdate to false', () => {
        service.setNewUpdate(false);
        expect(service.isNewUpdate).toBeFalsy();
    });

    // test for listenToFeedback
    it('should call socket on when communicating with server', () => {
        service.listenToFeedBack();
        expect(socketSpy.on).toHaveBeenCalled();
        expect(socketSpy.on).toHaveBeenCalledWith('feedbackOnJoin', jasmine.any(Function));
    });
    it('should call emit join game when joining a game', () => {
        const game = {
            name: 'radius',
            opponentName: '',
            gameName: 'BobLedge',
        };
        service.join(game);
        expect(socketSpy.emit).toHaveBeenCalledWith('joinGame', game);
        expect(service.isLeaving).toBeFalsy();
    });
    it('should reset game variables', () => {
        service.resetGameVariables();
        expect(service.isCreator).toBeFalsy();
        expect(service.isLeaving).toBeFalsy();
        expect(service.isReadyToPlay).toBeFalsy();
        expect(service.isRejected).toBeFalsy();
        expect(service.state).toEqual('');
    });
    it('should return leaving state', () => {
        expect(service.getLeavingState()).toBeFalsy();
    });
    it('should call emit cancel game when leaving a game', () => {
        service.leave('test');
        expect(socketSpy.emit).toHaveBeenCalledWith('cancelGame', 'test');
    });
    it('should call emit start game when starting a game', () => {
        service.startGame('test');
        expect(socketSpy.emit).toHaveBeenCalledWith('startGame', 'test');
    });
    it('should call emit reject opponent when rejecting a game', () => {
        service.rejectOpponent('test');
        expect(socketSpy.emit).toHaveBeenCalledWith('rejectOpponent', 'test');
    });
    it('should redirect player as method is being called', () => {
        service.redirect({
            gameId: 1,
            creatorName: 'test',
            opponentName: 'test',
            gameName: 'test',
        });
        expect(routerSpy.navigate).toHaveBeenCalled();
        expect(socketSpy.disconnect).toHaveBeenCalled();
    });
});
