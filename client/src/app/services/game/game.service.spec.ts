import { HttpResponse } from '@angular/common/http';
import { ElementRef, Renderer2, RendererFactory2 } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import * as constants from '@app/configuration/const-canvas';
import { GameInformation } from '@app/interfaces/game-information';
import { ImagePath } from '@app/interfaces/hint-diff-path';
import { Game, GameInfo } from '@common/game';
import { of } from 'rxjs';
import { GameCardHandlerService } from './game-card-handler-service.service';
import { GameDatabaseService } from './game-database.service';
import { GameService } from './game.service';
import { SocketClientService } from '@app/services/socket/socket-client.service';

import SpyObj = jasmine.SpyObj;

describe('GameService', () => {
    let rendererFactory2Spy: SpyObj<RendererFactory2>;
    let renderer2Spy: SpyObj<Renderer2>;
    let matDialogSpy: SpyObj<MatDialog>;
    let gameDataBaseSpy: SpyObj<GameDatabaseService>;
    let socketClientServiceSpy: SpyObj<SocketClientService>;
    let gameCardHandlerServiceSpy: SpyObj<GameCardHandlerService>;
    let audioMock: SpyObj<HTMLAudioElement>;
    let gameService: GameService;
    let path: ImagePath;
    let game: Game;
    let gameInformation: GameInformation;
    let gameInfo: GameInfo;

    beforeEach(() => {
        rendererFactory2Spy = jasmine.createSpyObj('RendererFactory2', ['createRenderer']);
        renderer2Spy = jasmine.createSpyObj('Renderer2', ['setStyle']);
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        gameDataBaseSpy = jasmine.createSpyObj('GameDataBaseService', ['getGameByName', 'createGameRecord', 'deleteGame', 'createGamingHistory']);
        gameCardHandlerServiceSpy = jasmine.createSpyObj('GameCardHandlerService', ['handleDelete']);
        socketClientServiceSpy = jasmine.createSpyObj('SocketClientService', [
            'getRoomTime',
            'stopTimer',
            'gameEnded',
            'findDifference',
            'getRoomName',
            'sendMessage',
        ]);
        audioMock = jasmine.createSpyObj('HTMLAudioElement', ['load', 'play']);
        gameDataBaseSpy.createGamingHistory.and.callFake(() => of(new HttpResponse({ body: 'OK' })));
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MessageDialogComponent],
            providers: [
                { provide: RendererFactory2, useValue: rendererFactory2Spy },
                { provide: Renderer2, useValue: renderer2Spy },
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: GameCardHandlerService, useValue: gameCardHandlerServiceSpy },
                { provide: GameDatabaseService, useValue: gameDataBaseSpy },
                { provide: SocketClientService, useValue: socketClientServiceSpy },
            ],
            imports: [MatDialogModule],
        });
    });

    beforeEach(() => {
        gameService = TestBed.inject(GameService);
        game = {
            gameName: 'Test Game',
            difficulty: 'Facile',
            originalImageData: 'string',
            modifiedImageData: 'string',
            listDifferences: ['1', '2', '3'],
        };
        gameInformation = { gameTitle: 'Test Game', gameMode: 'solo', gameDifficulty: 'Facile', nDifferences: 3 };
        gameInfo = {
            gameName: 'Test Game',
            difficulty: 'Facile',
            originalImageData: 'string',
            modifiedImageData: 'string',
            listDifferences: ['1', '2', '3'],
            rankingMulti: [],
            rankingSolo: [],
        };
        path = { differenceNotFound: './assets/img/difference-not-found.png', differenceFound: './assets/img/difference-found.png' };
        gameService.gameType = 'solo';
    });

    it('should be created', () => {
        expect(gameService).toBeTruthy();
    });

    it('getHeight should return default height', fakeAsync(() => {
        expect(gameService.height).toBe(constants.DEFAULT_HEIGHT);
    }));

    it('getHeight should return height', fakeAsync(() => {
        expect(gameService.width).toBe(constants.DEFAULT_WIDTH);
    }));

    it('should call defineVariables', () => {
        gameService.game = game;
        gameService.gameInformation = gameInformation;
        const nDifferencesNotFound = 3;
        gameService.defineVariables();
        expect(gameService.gameInformation.gameTitle).toBe(game.gameName);
        expect(gameService.gameInformation.gameMode).toBe('solo');
        expect(gameService.gameInformation.gameDifficulty).toBe(game.difficulty);
        expect(gameService.gameInformation.nDifferences).toBe(game.listDifferences.length);
        expect(gameService.totalDifferences).toBe(gameInformation.nDifferences);
        expect(gameService.differencesArray.length).toEqual(nDifferencesNotFound);
    });

    it('getGame should retrieve the game from the server and call defineVariables', () => {
        const mockGame = gameInfo;
        gameDataBaseSpy.getGameByName.and.returnValue(of(gameInfo));
        const defineVariablesSpy = spyOn(gameService, 'defineVariables');
        gameService.getGame(mockGame.gameName);
        expect(gameDataBaseSpy.getGameByName).toHaveBeenCalledWith(mockGame.gameName);
        expect(gameService.game).toEqual(mockGame);
        expect(gameDataBaseSpy.getGameByName).toHaveBeenCalled();
        expect(defineVariablesSpy).toHaveBeenCalled();
    });

    it('displayIcons should fill the array of differences for solo game mode', () => {
        gameService.totalDifferences = 3;
        gameService.path = path;
        gameService.differencesArray = new Array(3);
        gameService.displayIcons();
        for (let i = 0; i < gameService.totalDifferences; i++) {
            expect(gameService.differencesArray[i]).toEqual(gameService.path.differenceNotFound);
        }
        expect(gameService.differencesArray.length).toBe(3);
    });

    it('displayIcons should fill the opponent and player array of differences for multiplayer game mode', () => {
        gameService.gameType = 'double';
        gameService.totalDifferences = 3;
        gameService.path = path;
        gameService.opponentDifferencesArray = new Array(3);
        gameService.differencesArray = new Array(3);
        gameService.displayIcons();
        for (let i = 0; i < gameService.totalDifferences; i++) {
            expect(gameService.opponentDifferencesArray[i]).toEqual(gameService.path.differenceNotFound);
            expect(gameService.differencesArray[i]).toEqual(gameService.path.differenceNotFound);
        }
        expect(gameService.opponentDifferencesArray.length).toBe(3);
        expect(gameService.differencesArray.length).toBe(3);
    });

    it('displayGameEnded should open a dialog', () => {
        gameService.displayGameEnded('message', 'type', '00:00');
        const mockDialog = matDialogSpy.open.and.returnValue({
            afterClosed: () => of(true),
        } as MatDialogRef<MessageDialogComponent>);
        expect(mockDialog).toHaveBeenCalled();
    });

    it('reinitializeGame should reinitialize the game', () => {
        gameService.totalDifferences = 3;
        gameService.nDifferencesFound = 3;
        gameService.differencesArray = new Array(3);
        gameService.playerName = 'player';
        gameService.nDifferencesFound = 3;
        gameService.game = game;
        gameService.gameInformation = gameInformation;
        gameService.reinitializeGame();
        expect(gameService.totalDifferences).toBe(0);
        expect(gameService.nDifferencesFound).toBe(0);
        expect(gameService.differencesArray.length).toBe(0);
        expect(gameService.playerName).toBe('');
        expect(gameService.nDifferencesFound).toBe(0);
        expect(gameService.game.gameName).toBe('');
        expect(gameService.game.difficulty).toBe('');
        expect(gameService.game.originalImageData).toBe('./assets/image_empty.bmp');
        expect(gameService.game.modifiedImageData).toBe('./assets/image_empty.bmp');
        expect(gameService.game.listDifferences).toEqual([]);
        expect(gameService.gameInformation.gameTitle).toBe('');
        expect(gameService.gameInformation.gameMode).toBe('');
        expect(gameService.gameInformation.gameDifficulty).toBe('');
        expect(gameService.gameInformation.nDifferences).toBe(0);
    });

    it('should playSuccessAudio', () => {
        spyOn(window, 'Audio').and.returnValue(audioMock);
        gameService.playSuccessAudio();
        expect(audioMock.load).toHaveBeenCalled();
        expect(audioMock.play).toHaveBeenCalled();
    });

    it('should playFailureAudio', () => {
        spyOn(window, 'Audio').and.returnValue(audioMock);
        gameService.playFailureAudio();
        expect(audioMock.load).toHaveBeenCalled();
        expect(audioMock.play).toHaveBeenCalled();
    });

    it('getGameTime should mock and return time for seconds under 10 digit', () => {
        gameService.gameTime = 5;
        const time: string = gameService.getGameTime();
        expect(time).toBe('0:05');
    });

    it('getGameTime should mock and call getCount from socketClientService and return time for seconds above 10 digit', () => {
        gameService.gameTime = 45;
        const time: string = gameService.getGameTime();
        expect(time).toBe('0:45');
    });

    it('handleDifferenceFound should increment nDifferencesFound and update differencesArray when game not ended', () => {
        gameService.nDifferencesFound = 0;
        gameService.totalDifferences = 3;
        gameService.differencesArray = [path.differenceNotFound, path.differenceNotFound, path.differenceNotFound];
        gameService.handleDifferenceFound();
        expect(gameService.nDifferencesFound).toBe(1);
        expect(gameService.differencesArray).toEqual([path.differenceFound, path.differenceNotFound, path.differenceNotFound]);
    });

    it('handleDifferenceFound should call endGame, multiGameEnd and findDifference when game ended for multi game mode', () => {
        gameService.nDifferencesFound = 3;
        gameService.totalDifferences = 3;
        gameService.differencesArray = [path.differenceFound, path.differenceFound, path.differenceFound];
        spyOn(gameService, 'endGame');
        spyOn(gameService, 'multiGameEnd').and.returnValue(true);
        gameService.gameType = 'double';
        gameService.handleDifferenceFound();
        expect(gameService.endGame).toHaveBeenCalled();
        expect(gameService.multiGameEnd).toHaveBeenCalled();
        expect(socketClientServiceSpy.findDifference).toHaveBeenCalled();
    });

    it('handleDifferenceFound should call endGame for solo game mode', () => {
        spyOn(gameService, 'totalDifferenceReached').and.returnValue(true);
        gameService.differencesArray = [path.differenceFound, path.differenceFound, path.differenceFound];
        spyOn(gameService, 'endGame');
        gameService.handleDifferenceFound();
        expect(gameService.endGame).toHaveBeenCalled();
    });

    it('handlePlayerDifference should call pop and unshift opponentDifferencesArray', () => {
        gameService.opponentDifferencesArray = [path.differenceNotFound, path.differenceNotFound, path.differenceNotFound];
        gameService.handlePlayerDifference();
        expect(gameService.opponentDifferencesArray).toEqual([path.differenceFound, path.differenceNotFound, path.differenceNotFound]);
    });

    it('multiGameEnd should return true if totalDifference is even and nDifferencesFound equal to totalDifferences/2', () => {
        gameService.totalDifferences = 4;
        gameService.nDifferencesFound = 2;
        const result = gameService.multiGameEnd();
        expect(result).toBe(true);
    });

    it('deleteGame should call deleteGame from gameDatabase with correct parameter', () => {
        gameService.deleteGame('game');
        expect(gameCardHandlerServiceSpy.handleDelete).toHaveBeenCalled();
        expect(gameDataBaseSpy.deleteGame).toHaveBeenCalledWith('game');
    });

    it('endGame should call stopTimer, gameEnded, saveGameRecord, reinitializeGame and displayGameEnded', () => {
        spyOn(gameService, 'saveGameRecord');
        spyOn(gameService, 'reinitializeGame');
        spyOn(gameService, 'displayGameEnded');
        gameService.endGame();
        expect(socketClientServiceSpy.stopTimer).toHaveBeenCalled();
        expect(socketClientServiceSpy.gameEnded).toHaveBeenCalled();
        expect(gameService.saveGameRecord).toHaveBeenCalled();
        expect(gameService.reinitializeGame).toHaveBeenCalled();
        expect(gameService.displayGameEnded).toHaveBeenCalled();
    });

    it('sendFoundMessage should sendMessage and push to messageList', () => {
        gameService.playerName = 'test';
        gameService.gameType = 'double';
        const message = {
            message: new Date().toLocaleTimeString() + ' - ' + ' Différence trouvée par test',
            userName: 'test',
            mine: true,
            color: '#00FF00',
            pos: '50%',
            event: true,
        };
        socketClientServiceSpy.messageList = [];
        gameService.sendFoundMessage();
        expect(socketClientServiceSpy.sendMessage).toHaveBeenCalled();
        expect(socketClientServiceSpy.messageList).toEqual([message]);
    });

    it('sendErrorMessage should sendMessage and push to messageList', () => {
        gameService.playerName = 'test';
        gameService.gameType = 'double';
        const message = {
            message: new Date().toLocaleTimeString() + ' - ' + ' Erreur par test',
            userName: 'test',
            mine: true,
            color: '#FF0000',
            pos: '50%',
            event: true,
        };
        socketClientServiceSpy.messageList = [];
        gameService.sendErrorMessage();
        expect(socketClientServiceSpy.sendMessage).toHaveBeenCalled();
        expect(socketClientServiceSpy.messageList).toEqual([message]);
    });

    it('saveGameRecord should call createGameRecord from gameDataBaseService for multi mode', () => {
        gameService.gameType = 'double';
        const gameTitle = 'gameName';
        const gameMode = 'double';
        const playerName = 'playerName';
        const dateStart = new Date().getTime().toString();
        const gameTime = '01:00';
        const gameRecordMock = { gameName: gameTitle, typeGame: gameMode, playerName, dateStart, time: gameTime };
        gameService.gameInformation.gameTitle = gameTitle;
        gameService.gameInformation.gameMode = gameMode;
        gameService.playerName = playerName;
        spyOn(gameService, 'getGameTime').and.returnValue(gameTime);
        const gameRecordHttpResponse = new HttpResponse({ body: gameRecordMock.toString() });
        gameDataBaseSpy.createGameRecord.and.returnValue(of(gameRecordHttpResponse));
        gameService.saveGameRecord();
        expect(gameDataBaseSpy.createGameRecord).toHaveBeenCalled();
    });

    it('saveGameRecord should call createGameRecord from gameDataBaseService for multi mode', () => {
        gameService.gameType = 'solo';
        const playerName = 'playerName';
        const dateStart = new Date().getTime().toString();
        const gameRecordMock = { gameName: 'gameName', typeGame: 'solo', playerName, dateStart, time: '01:00' };
        gameService.gameInformation.gameTitle = 'gameName';
        gameService.gameInformation.gameMode = 'solo';
        gameService.playerName = playerName;
        spyOn(gameService, 'getGameTime').and.returnValue('01:00');
        const gameRecordHttpResponse = new HttpResponse({ body: gameRecordMock.toString() });
        gameDataBaseSpy.createGameRecord.and.returnValue(of(gameRecordHttpResponse));
        gameService.saveGameRecord();
        expect(gameDataBaseSpy.createGameRecord).toHaveBeenCalled();
    });

    it('should toggle the visibility of two canvases at a regular interval', fakeAsync(() => {
        const intervalTime = 125;
        const blinkCount = 8;
        const expectedCalls = blinkCount * 2;
        const canvas1: ElementRef<HTMLCanvasElement> = new ElementRef<HTMLCanvasElement>(document.createElement('canvas'));
        const canvas2: ElementRef<HTMLCanvasElement> = new ElementRef<HTMLCanvasElement>(document.createElement('canvas'));
        gameService['renderer'] = renderer2Spy;
        gameService.blinkDifference(canvas1, canvas2);
        tick(intervalTime * blinkCount);
        expect(renderer2Spy.setStyle.calls.count()).toBe(expectedCalls);
        expect(renderer2Spy.setStyle.calls.argsFor(0)).toEqual([canvas1.nativeElement, 'visibility', 'hidden']);
        expect(renderer2Spy.setStyle.calls.argsFor(expectedCalls - 1)).toEqual([canvas2.nativeElement, 'visibility', 'visible']);
    }));
});