/* eslint-disable max-lines */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { GamePageComponent } from './game-page.component';
import { GameService } from '@app/services/game/game.service';
import { SocketClientService } from '@app/services/socket/socket-client.service';
import { GameRecorderService } from '@app/services/game/game-recorder.service';
import { CheatModeService } from '@app/services/cheat-mode/cheat-mode.service';
import { HintsService } from '@app/services/hints/hints.service';
import { MessageAreaComponent } from '@app/components/message-area/message-area.component';
import { DrawService } from '@app/services/draw/draw.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { Subject, of } from 'rxjs';
// import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;
import { GameMessageEvent } from '@app/classes/game-records/message-event';
import { Game } from '@common/game';
import { ElementRef } from '@angular/core';
class ActivatedRouteMock {
    params = { subscribe: jasmine.createSpy('subscribe') };
    snapshot = {
        paramMap: {
            get: jasmine.createSpy('get').and.returnValues('defaultName', 'defaultPlayer'),
        },
    };
}

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let gameServiceSpy: SpyObj<GameService>;
    let socketClientServiceSpy: SpyObj<SocketClientService>;
    let gameRecorderServiceSpy: SpyObj<GameRecorderService>;
    let cheatModeServiceSpy: SpyObj<CheatModeService>;
    let hintsServiceSpy: SpyObj<HintsService>;
    let drawServiceSpy: SpyObj<DrawService>;
    let gameState: Subject<boolean>;
    let playerFoundDiff: Subject<string>;
    let diffFound: Subject<Set<number>>;
    let timeLimitStatus: Subject<boolean>;
    let difference: Subject<Set<number>>;
    let teammateStatus: Subject<boolean>;
    let messageToAdd: Subject<GameMessageEvent>;
    let imageLoaded: Subject<Game>;
    let mouseEvent: MouseEvent;
    let notADiff: Set<number>;

    beforeEach(() => {
        socketClientServiceSpy = jasmine.createSpyObj('SocketClientService', [
            'connect',
            'joinRoomSolo',
            'disconnect',
            'leaveRoom',
            'getRoomTime',
            'sendRoomName',
            'sendDifference',
            'gameEnded',
            'getGame',
            'getRoomName',
        ]);
        gameServiceSpy = jasmine.createSpyObj('GameService', [
            'displayIcons',
            'setStartDate',
            'handleDisconnect',
            'getClassicGame',
            'reinitializeGame',
            'mouseHitDetect',
            'getTimeLimitGame',
            'initRewind',
            'getSetDifference',
            'displayGameEnded',
            'getLimitGameTime',
            'sendFoundMessage',
            'handleDifferenceFound',
            'sendErrorMessage',
        ]);
        cheatModeServiceSpy = jasmine.createSpyObj('CheatModeService', [
            'isCheatMode',
            'cheatModeKeyBinding',
            'removeHotkeysEventListener',
            'resetService',
            'stopCheating',
        ]);
        hintsServiceSpy = jasmine.createSpyObj('HintsService', [
            'getHints',
            'removeHotkeysEventListener',
            'resetService',
            'stopHints',
            'hintsKeyBinding',
            'stopInterval',
        ]);
        drawServiceSpy = jasmine.createSpyObj('DrawService', ['clearDiff', 'getImageDateFromDataUrl']);
        gameRecorderServiceSpy = jasmine.createSpyObj('GameRecorderService', ['getGameRecorder', 'subscribe', 'do', 'startRewind']);
        gameState = new Subject<boolean>();
        playerFoundDiff = new Subject<string>();
        diffFound = new Subject<Set<number>>();
        timeLimitStatus = new Subject<boolean>();
        difference = new Subject<Set<number>>();
        teammateStatus = new Subject<boolean>();
        messageToAdd = new Subject<GameMessageEvent>();
        imageLoaded = new Subject<Game>();
        socketClientServiceSpy.gameState$ = gameState.asObservable();
        socketClientServiceSpy.playerFoundDiff$ = playerFoundDiff.asObservable();
        socketClientServiceSpy.diffFound$ = diffFound.asObservable();
        socketClientServiceSpy.timeLimitStatus$ = timeLimitStatus.asObservable();
        socketClientServiceSpy.difference$ = difference.asObservable();
        socketClientServiceSpy.teammateStatus$ = teammateStatus.asObservable();
        socketClientServiceSpy.messageToAdd$ = messageToAdd.asObservable();
        socketClientServiceSpy.imageLoaded$ = imageLoaded.asObservable();
        mouseEvent = new MouseEvent('click', { button: 0 });
        gameServiceSpy.mode = 'classic';
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, MessageAreaComponent],
            providers: [
                { provide: SocketClientService, useValue: socketClientServiceSpy },
                { provide: GameRecorderService, useValue: gameRecorderServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: CheatModeService, useValue: cheatModeServiceSpy },
                { provide: HintsService, useValue: hintsServiceSpy },
                { provide: DrawService, useValue: drawServiceSpy },
                { provide: ActivatedRoute, useValue: ActivatedRouteMock },
            ],
            imports: [RouterTestingModule, MatDialogModule, HttpClientModule],
        }).compileComponents();
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        component.route = new ActivatedRouteMock() as unknown as ActivatedRoute;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set up the game for rewind and subscribe to game events', () => {
        spyOn(component, 'loading');
        spyOn(component, 'subscribeToGameStatus');
        spyOn(component, 'subscribeToTimeLimit');
        spyOn(component, 'subscribeToDifference');
        spyOn(component, 'loadImages');

        component.ngOnInit();

        expect(component.gameService.setStartDate).toHaveBeenCalled();
        expect(component.gameService.handleDisconnect).toHaveBeenCalled();
        expect(component.loading).toHaveBeenCalled();
        expect(component.subscribeToGameStatus).not.toHaveBeenCalled();
        expect(component.subscribeToTimeLimit).not.toHaveBeenCalled();
        expect(component.subscribeToDifference).not.toHaveBeenCalled();
        expect(component.cheatModeService.cheatModeKeyBinding).toHaveBeenCalled();
        expect(component.hintsService.hintsKeyBinding).not.toHaveBeenCalled();
        expect(component.hintsService.resetService).not.toHaveBeenCalled();
        expect(component.loadImages).not.toHaveBeenCalled();
        expect(component.cheatModeService.resetService).not.toHaveBeenCalled();
        expect(component.socket.connect).toHaveBeenCalled();
        expect(component.gameService.getTimeLimitGame).not.toHaveBeenCalled();
        expect(component.gameService.getClassicGame).toHaveBeenCalled();
        expect(component.gameService.initRewind).not.toHaveBeenCalled();
        expect(component.cheatModeService.removeHotkeysEventListener).not.toHaveBeenCalled();
        expect(component.hintsService.removeHotkeysEventListener).not.toHaveBeenCalled();
    });

    it('should ngAfterViewInit', () => {
        component.gameService.gameType = 'solo';
        component.gameService.mode = '';
        component.ngAfterViewInit();
        expect(socketClientServiceSpy.joinRoomSolo).toHaveBeenCalled();
        expect(component.ngAfterViewInit).toBeTruthy();
    });

    it('startRewind should call stopCheating, stopHints and startRewind', () => {
        component.notRewinding = false;
        component.startRewind();
        expect(cheatModeServiceSpy.stopCheating).toHaveBeenCalled();
        expect(hintsServiceSpy.stopHints).toHaveBeenCalled();
        expect(gameRecorderServiceSpy.startRewind).toHaveBeenCalled();
    });

    it('startRewind should call initForRewind if notRewinding is true', () => {
        spyOn(component, 'initForRewind');
        component.notRewinding = true;
        component.startRewind();
        expect(component.initForRewind).toHaveBeenCalled();
    });

    it('gameTime should return gameService gameTime', () => {
        gameServiceSpy.gameTime = 10;
        expect(component.gameTime).toEqual(gameServiceSpy.gameTime);
    });

    it('currentTimer should return roomTime', () => {
        const expectedTime = 10;
        socketClientServiceSpy.getRoomTime.and.returnValue(expectedTime);
        expect(component.currentTimer).toEqual(expectedTime);
    });

    it('getCanvasImageModifier should return modifiedImage.nativeElement', () => {
        const expectedImage = 'image';
        component.modifiedImage = { nativeElement: expectedImage } as unknown as ElementRef<HTMLCanvasElement>;
        expect(component.getCanvasImageModifier).toEqual(component.modifiedImage.nativeElement);
    });

    it('mouseHitDetect should call mouseHitDetect from gameService', () => {
        component.mouseHitDetect(mouseEvent);
        expect(gameServiceSpy.mouseHitDetect).toHaveBeenCalled();
    });

    it('showMessage should call pushMessage with correct parameters', () => {
        const message = { message: 'test', playerName: 'str', mine: true, color: 'st', pos: 'string', event: true };
        spyOn(component.chat, 'pushMessage').and.callThrough();
        socketClientServiceSpy.messageList = new Array();
        component.showMessage(message);
        expect(component.chat.pushMessage).toHaveBeenCalledWith(message);
    });
    it('should call the clearCanvases method', () => {
        // Create mock elements for the nativeElement properties
        component.canvas0 = { nativeElement: document.createElement('canvas') };
        component.canvas1 = { nativeElement: document.createElement('canvas') };
        component.canvas2 = { nativeElement: document.createElement('canvas') };
        component.canvas3 = { nativeElement: document.createElement('canvas') };
        component.canvasCheat0 = { nativeElement: document.createElement('canvas') };
        component.canvasCheat1 = { nativeElement: document.createElement('canvas') };

        spyOn(DrawService, 'clearDiff');
        component.clearCanvases();
        // Expect that all canvases were cleared
        expect(DrawService.clearDiff).toHaveBeenCalledWith(component.canvas0.nativeElement);
        expect(DrawService.clearDiff).toHaveBeenCalledWith(component.canvas1.nativeElement);
        expect(DrawService.clearDiff).toHaveBeenCalledWith(component.canvas2.nativeElement);
        expect(DrawService.clearDiff).toHaveBeenCalledWith(component.canvas3.nativeElement);
        expect(DrawService.clearDiff).toHaveBeenCalledWith(component.canvasCheat0.nativeElement);
        expect(DrawService.clearDiff).toHaveBeenCalledWith(component.canvasCheat1.nativeElement);

        // Expect that loadImages was called
        // expect(canvasCheat1.loadImages).toHaveBeenCalled();
    });
    it('ngAfterViewInit should call joinRoomSolo if gameType is solo', () => {
        component.gameService.gameType = 'solo';
        component.ngAfterViewInit();
        expect(socketClientServiceSpy.joinRoomSolo).toHaveBeenCalled();
    });
    it('ngAfterViewInit should not call joinRoomSolo if gameType is not solo', () => {
        component.gameService.gameType = 'double';
        component.ngAfterViewInit();
        expect(socketClientServiceSpy.sendRoomName).toHaveBeenCalled();
    });
    it('initForRewind should call initRewind from gameService', () => {
        component.gameService.game = {
            gameName: 'difference 1',
            difficulty: 'Facile',
            originalImageData: 'imageOriginal1',
            modifiedImageData: 'imageModifie1',
            listDifferences: ['diffrence 1', 'difference 2'],
        };
        component.initForRewind();
        expect(gameServiceSpy.initRewind).toHaveBeenCalled();
    });
    it('initForRewind should call disconnect from socket', () => {
        component.notRewinding = true;
        component.gameService.game = {
            gameName: 'difference 1',
            difficulty: 'Facile',
            originalImageData: 'imageOriginal1',
            modifiedImageData: 'imageModifie1',
            listDifferences: ['diffrence 1', 'difference 2'],
        };
        component.initForRewind();
        expect(socketClientServiceSpy.disconnect).toHaveBeenCalled();
    });
    it('subscribeToTimeLimit should call subscribeToTimeLimit from socket', () => {
        component.subscribeToTimeLimit();
        expect(gameServiceSpy.displayGameEnded).not.toHaveBeenCalled();
    });
    it('subscribeToTimeLimit should call displayGameEnded', () => {
        socketClientServiceSpy.timeLimitStatus$ = of(true);
        component.subscribeToTimeLimit();
        expect(gameServiceSpy.displayGameEnded).toHaveBeenCalled();
    });
    it('subscribeToTimeLimit should call displayGameEnded', () => {
        socketClientServiceSpy.timeLimitStatus$ = of(false);
        component.subscribeToTimeLimit();
        expect(gameServiceSpy.displayGameEnded).toHaveBeenCalled();
    });
    it('subscribeToTimeLimit should change gameType mode', () => {
        socketClientServiceSpy.teammateStatus$ = of(true);
        component.subscribeToTimeLimit();
        expect(gameServiceSpy.gameType).toEqual('solo');
    });
    it('subscribeToTimeLimit should call sendDifference of socket', () => {
        const numberSet: Set<number> = new Set([1, 2, 3]);
        socketClientServiceSpy.difference$ = of(numberSet);
        component.subscribeToTimeLimit();
        expect(socketClientServiceSpy.sendDifference).not.toHaveBeenCalled();
    });
    it('subscribeToGameStatus should call displayGameEnded', () => {
        socketClientServiceSpy.gameState$ = of(true);
        component.subscribeToGameStatus();
        expect(gameServiceSpy.displayGameEnded).toHaveBeenCalled();
    });
    it('should call the appropriate methods when a difference is found', () => {
        const mockDifference: Set<number> = new Set([1, 2, 3]);
        const game1 = {
            gameName: 'difference 1',
            difficulty: 'Facile',
            originalImageData: 'imageOriginal1',
            modifiedImageData: 'imageModifie1',
            listDifferences: ['diffrence 1', 'difference 2'],
        } as Game;
        // Set up the spy objects to return the necessary values
        socketClientServiceSpy.diffFound$ = of(mockDifference);
        socketClientServiceSpy.difference$ = of(mockDifference);
        socketClientServiceSpy.getRoomName.and.returnValue('room');
        socketClientServiceSpy.getGame.and.returnValue(game1);
        gameServiceSpy.mode = 'tempsLimite';
        component.subscribeToDifference();
        expect(socketClientServiceSpy.sendDifference).toHaveBeenCalledWith(mockDifference, 'room');
        expect(gameServiceSpy.getSetDifference).not.toHaveBeenCalledWith([]);
    });
    it('should call the appropriate methods when a difference is not found', () => {
        difference.next(undefined as unknown as Set<number>);
        component.subscribeToDifference();
        expect(socketClientServiceSpy.sendDifference).not.toHaveBeenCalledWith(notADiff, 'room');
    });

    it('ngOnInit should not call getLimitGameTime', () => {
        component.gameService.game = {
            gameName: 'difference 1',
            difficulty: 'Facile',
            originalImageData: 'imageOriginal1',
            modifiedImageData: 'imageModifie1',
            listDifferences: ['diffrence 1', 'difference 2'],
        };
        component.gameService.mode = 'classic';
        component.gameService.gameType = 'solo';
        component.ngOnInit();
        expect(gameServiceSpy.getTimeLimitGame).not.toHaveBeenCalled();
    });
    it('ngOnInit should not call getLimitGameTime', () => {
        component.gameService.game = {
            gameName: 'difference 1',
            difficulty: 'Facile',
            originalImageData: 'imageOriginal1',
            modifiedImageData: 'imageModifie1',
            listDifferences: ['diffrence 1', 'difference 2'],
        };
        gameServiceSpy.gameType = 'solo';
        expect(hintsServiceSpy.hintsKeyBinding).not.toHaveBeenCalled();
    });
    it('should ngOnInit call loadImages', () => {
        const mockGame: Game = {
            gameName: 'G1',
            difficulty: 'Facile',
            originalImageData: '000',
            modifiedImageData: '4565',
            listDifferences: ['1', '2'],
        };
        spyOn(component, 'loadImages').and.callThrough();
        component.gameService.game = mockGame;
        component.gameService.gameType = 'solo';
        component.gameService.mode = 'tempsLimite';
        socketClientServiceSpy.imageLoaded$ = of(mockGame);
        component.ngOnInit();
        expect(component.loadImages).not.toHaveBeenCalled();
    });
});
