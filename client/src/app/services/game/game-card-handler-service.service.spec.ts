import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameIdentifier } from '@app/interfaces/game-handler';
import { SocketClient } from '@app/utils/socket-client';
import { SocketTestHelper } from '@app/utils/socket-helper';
import { Socket } from 'socket.io-client';
import { GameCardHandlerService } from './game-card-handler-service.service';
import SpyObj = jasmine.SpyObj;

describe('GameCardHandlerService', () => {
    let service: GameCardHandlerService;
    let socketSpy: SpyObj<Socket>;
    let socketClient: SpyObj<SocketClient>;

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    beforeEach(() => {
        socketClient = jasmine.createSpyObj('SocketClient', ['isSocketAlive', 'connect', 'on', 'emit', 'send', 'disconnect']);
        socketSpy = jasmine.createSpyObj('Socket', ['on', 'emit', 'disconnect', 'connect']);
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
        service.games.set('test', 1);
        service.games.set('toaster', 0);
        service.games.set('dad', 0);
        service.socket = socketSpy;
        socketClient.socket = new SocketTestHelper() as unknown as Socket;
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
    it('should return false as there is no creator when function being called', () => {
        expect(service.getCancelingState()).toBeFalsy();
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
        expect(socketSpy.on).toHaveBeenCalledWith('updateStatus', jasmine.any(Function));
        expect(socketSpy.on).toHaveBeenCalledWith('globalEvent', jasmine.any(Function));
    });
    it('should call emit join game when joining a game', () => {
        const game = {
            name: 'radius',
            opponentName: '',
            gameName: 'BobLedge',
            gameType: 'classic',
            mode: 'classic',
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
        expect(service.isGameAvailable).toBeTruthy();
        expect(service.state).toEqual('');
    });
    it('should return leaving state', () => {
        expect(service.getLeavingState()).toBeFalsy();
    });
    it('should return true as the game is available', () => {
        expect(service.getGameAvailability()).toBeTruthy();
    });
    it('should set readiness status of the player to start the game', () => {
        service.setReadinessStatus(false);
        expect(service.isReadyToPlay).toBeFalsy();
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
    it('should call emit reject opponent when rejecting a game', () => {
        service.handleDelete('test');
        expect(socketSpy.emit).toHaveBeenCalledWith('handleDelete', 'test');
    });
    it('should redirect player as method is being called', () => {
        service.redirect({
            gameId: 1,
            creatorName: 'test',
            opponentName: 'test',
            gameName: 'test',
            mode: 'classic',
        });
        expect(routerSpy.navigate).toHaveBeenCalled();
    });
    it('should redirect player to home page', () => {
        service.redirectToHomePage();
        expect(routerSpy.navigate).toHaveBeenCalled();
    });

    it('setReadinessStatus() should set the isReadyToPlay value ', () => {
        service.setReadinessStatus(true);
        expect(service.isReadyToPlay).toBe(true);
    });
    it('handleDelete() should emit handleDelete and call listenToFeedBack ', () => {
        service.handleDelete('test');
        expect(socketSpy.emit).toHaveBeenCalledWith('handleDelete', 'test');
        expect(socketSpy.on).toHaveBeenCalled();
    });

    // test for updateGameStatus
    it('should send findAllGamesStatus when calling updateGameStatus', () => {
        const gameNames = ['test', 'toaster', 'dad'];
        service.updateGameStatus(gameNames);
        expect(socketClient.send).toHaveBeenCalled();
    });

    // test for startSpecificGame
    it('should emit startGame when calling startSpecificGame', () => {
        const gameIdentifier: GameIdentifier = {
            gameId: 1,
            gameName: 'limitedTime99999',
            creatorName: 'string',
            opponentName: 'string',
            mode: 'string',
        };
        service.startSpecificGame(gameIdentifier);
        expect(service.gameName).toEqual('limitedTime99999');
    });
    it('should emit startGame when calling startSpecificGame', () => {
        const gameIdentifier: GameIdentifier = {
            gameId: 1,
            gameName: 'bug',
            creatorName: 'string',
            opponentName: 'string',
            mode: 'classic',
        };
        service.startSpecificGame(gameIdentifier);
        expect(service.isReadyToPlay).toBeTruthy();
    });
    // test for runAction(event: string, object: unknown)
    it('should call runAction for gameUnavailable', () => {
        const event = 'gameUnavailable';
        const object = 'test';
        service.runAction(event, object);
        expect(service.isGameAvailable).toBeFalsy();
    });
    it('should call runAction for feedbackOnJoin', () => {
        const event = 'feedbackOnJoin';
        const object = 'test';
        service.runAction(event, object);
        expect(service.isCreator).toBeTruthy();
        expect(service.opponentPlayer).toBe('test');
    });
    it('should call runAction for feedbackOnAccept', () => {
        const event = 'feedbackOnAccept';
        const object = 'test';
        service.isCreator = true;
        service.runAction(event, object);
        expect(service.state).toBe('Accepter');
        expect(service.opponentPlayer).toBe('test');
    });
    it('should call runAction for feedbackOnWait', () => {
        const event = 'feedbackOnWait';
        const object = 'test';
        service.runAction(event, object);
        expect(service.opponentPlayer).toBe('test');
    });
    it('should call runAction for feedbackOnWaitLonger', () => {
        const event = 'feedbackOnWaitLonger';
        const object = 'test';
        service.runAction(event, object);
        expect(service.opponentPlayer).toBe('test');
    });
    it('should call runAction for feedbackOnStart', () => {
        const event = 'feedbackOnStart';

        const object: GameIdentifier = {
            gameId: 1,
            gameName: 'bug',
            creatorName: 'string',
            opponentName: 'string',
            mode: 'classic',
        };
        service.runAction(event, object);
        expect(service.isReadyToPlay).toBeTruthy();
    });
    it('should call runAction for feedbackOnLeave', () => {
        const event = 'feedBackOnLeave';
        const object = 'test';
        service.runAction(event, object);
        expect(service.isCreatorLeft).toBeTruthy();
        expect(service.isLeaving).toBeTruthy();
    });
    it('should call runAction for feedbackOnReject', () => {
        const event = 'feedbackOnReject';
        const object = 'test';
        service.runAction(event, object);
        expect(service.isRejected).toBeTruthy();
        expect(service.isLeaving).toBeTruthy();
    });
    it('should call runAction for disconnect', () => {
        const event = 'disconnect';
        const object = 'test';
        service.runAction(event, object);
        expect(service.isLeaving).toBeTruthy();
    });
    it('should call runAction for default', () => {
        const event = 'callDefault';
        const object = 'test';
        service.runAction(event, object);
        expect(service.isLeaving).toBeFalsy();
    });
});
