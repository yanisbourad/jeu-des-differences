import { HttpResponse } from '@angular/common/http';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import * as constants from '@app/configuration/const-canvas';
import * as constTest from '@app/configuration/const-test';
import * as constantsTime from '@app/configuration/const-time';
import { GameInformation } from '@app/interfaces/game-information';
import { ImagePath } from '@app/interfaces/hint-diff-path';
import { Game, GameInfo } from '@common/game';
import { of } from 'rxjs';
import { GameCardHandlerService } from './game-card-handler-service.service';
import { GameDatabaseService } from './game-database.service';
import { GameService } from './game.service';
import { SocketClientService } from '@app/services/socket/socket-client.service';
import { GameHelperService } from './game-helper.service';

import SpyObj = jasmine.SpyObj;

describe('GameService', () => {
    let gameDataBaseSpy: SpyObj<GameDatabaseService>;
    let socketClientServiceSpy: SpyObj<SocketClientService>;
    let gameCardHandlerServiceSpy: SpyObj<GameCardHandlerService>;
    let gameHelperServiceSpy: SpyObj<GameHelperService>;
    let gameService: GameService;
    let path: ImagePath;
    let game: Game;
    let gameInformation: GameInformation;
    let gameInfo: GameInfo;
    let mouseEvent: MouseEvent;

    beforeEach(() => {
        gameDataBaseSpy = jasmine.createSpyObj('GameDataBaseService', [
            'getGameByName',
            'createGameRecord',
            'deleteGame',
            'createGamingHistory',
            'deleteOneGameRecords',
        ]);
        gameCardHandlerServiceSpy = jasmine.createSpyObj('GameCardHandlerService', ['handleDelete']);
        gameHelperServiceSpy = jasmine.createSpyObj('GameHelperService', [
            'getGameTime',
            'globalMessage',
            'sendErrorMessage',
            'sendFoundMessage',
            'displayGameEnded',
            'displayGiveUp',
        ]);
        socketClientServiceSpy = jasmine.createSpyObj('SocketClientService', [
            'getRoomTime',
            'stopTimer',
            'gameEnded',
            'findDifference',
            'getRoomName',
            'sendMessage',
            'getGame',
            'sendMousePosition',
        ]);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MessageDialogComponent],
            providers: [
                { provide: GameCardHandlerService, useValue: gameCardHandlerServiceSpy },
                { provide: GameDatabaseService, useValue: gameDataBaseSpy },
                { provide: SocketClientService, useValue: socketClientServiceSpy },
                { provide: GameHelperService, useValue: gameHelperServiceSpy },
            ],
            imports: [MatDialogModule],
        });
    });

    beforeEach(() => {
        gameService = TestBed.inject(GameService);
        game = { gameName: 'Game', difficulty: 'Facile', originalImageData: 'string', modifiedImageData: 'string', listDifferences: ['1', '2', '3'] };
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
        mouseEvent = new MouseEvent('click', { button: 0 });
        path = { differenceNotFound: './assets/img/difference-not-found.png', differenceFound: './assets/img/difference-found.png' };
        gameService.gameType = 'solo';
        gameHelperServiceSpy.path = path;
        gameDataBaseSpy.createGameRecord.and.callFake(() => of(new HttpResponse({ body: 'OK' })));
        gameDataBaseSpy.createGamingHistory.and.callFake(() => of(new HttpResponse({ body: 'OK' })));
    });

    it('should be created', () => {
        expect(gameService).toBeTruthy();
    });

    it('getWidth should return default height', fakeAsync(() => {
        expect(gameService.width).toBe(constants.DEFAULT_WIDTH);
    }));

    it('should call defineVariables and define some values for the game', () => {
        gameService.mode = 'tempsLimite';
        gameService.game = game;
        gameService.gameInformation = gameInformation;
        gameService.defineVariables();
        expect(gameService.gameInformation.gameTitle).toBe(game.gameName);
        expect(gameService.gameInformation.gameMode).toBe('solo');
        expect(gameService.gameInformation.gameDifficulty).toBe(game.difficulty);
        expect(gameService.gameInformation.nDifferences).toBe(game.listDifferences.length);
    });

    it('getClassicGame should retrieve the game from the server, call defineVariables and display icons', () => {
        const mockGame = gameInfo;
        gameDataBaseSpy.getGameByName.and.returnValue(of(gameInfo));
        const defineVariablesSpy = spyOn(gameService, 'defineVariables');
        const displayIconsSpy = spyOn(gameService, 'displayIcons');
        gameService.getClassicGame(mockGame.gameName);
        expect(gameDataBaseSpy.getGameByName).toHaveBeenCalledWith(mockGame.gameName);
        expect(gameService.game).toEqual(mockGame);
        expect(gameDataBaseSpy.getGameByName).toHaveBeenCalled();
        expect(defineVariablesSpy).toHaveBeenCalled();
        expect(displayIconsSpy).toHaveBeenCalled();
    });

    it('getTimeLimitGame should retrieve the game with the socket, call defineVariables and display icons', fakeAsync(() => {
        const mockGame = gameInfo;
        const defineVariablesSpy = spyOn(gameService, 'defineVariables');
        const displayIconsSpy = spyOn(gameService, 'displayIcons');
        socketClientServiceSpy.getGame.and.returnValue(gameInfo);
        gameService.getTimeLimitGame();
        tick(constantsTime.LOADING_TIMEOUT);
        expect(gameService.game).toEqual(mockGame);
        expect(defineVariablesSpy).toHaveBeenCalled();
        expect(displayIconsSpy).toHaveBeenCalled();
    }));

    it('displayIcons should call setIcons for solo classic game mode', () => {
        const setIconsSpy = spyOn(gameService, 'setIcons');
        gameService.displayIcons();
        expect(setIconsSpy).toHaveBeenCalled();
    });

    it('displayIcons should call setIcons for multi timeLimit game mode', () => {
        gameService.gameType = 'double';
        gameService.mode = 'tempsLimite';
        const setIconsSpy = spyOn(gameService, 'setIcons');
        gameService.displayIcons();
        expect(setIconsSpy).toHaveBeenCalled();
    });

    it('setIcons should set difference array', () => {
        gameService.totalDifferences = 3;
        gameService.differencesArray = new Array(3);
        gameService.setIcons();
        for (let i = 0; i < gameService.totalDifferences; i++) {
            expect(gameService.differencesArray[i]).toEqual(gameHelperServiceSpy.path.differenceNotFound);
        }
        expect(gameService.differencesArray.length).toBe(3);
    });

    it('soloEndConditionReached should return true if nDifferencesFound equal totalDifferences and the mode is not timeLimit', () => {
        gameService.nDifferencesFound = gameService.totalDifferences;
        gameService.mode = '';
        gameService.soloEndConditionReached();
        expect(gameService.soloEndConditionReached()).toBeTrue();
    });

    it('reduceNbrDifference should increment nDifferencesFound and and switch path in differenceArray ', () => {
        gameService.differencesArray = new Array(3);
        gameService.nDifferencesFound = 0;
        gameService.reduceNbrDifferences();
        expect(gameService.nDifferencesFound).toBe(1);
        expect(gameService.differencesArray[0]).toEqual(gameHelperServiceSpy.path.differenceFound);
    });

    it('displayGameEnded should call displayGameEnded from gameHelperService with correct parameters', () => {
        gameService.mode = 'mode';
        gameService.displayGameEnded('test', 'test', 'test');
        expect(gameHelperServiceSpy.displayGameEnded).toHaveBeenCalledWith({ msg: 'test', type: 'test', time: 'test', mode: 'mode' });
    });

    it('setStartDate should set startDate', () => {
        gameService.setStartDate('01-12-2023');
        expect(gameService.startDate).toEqual('01-12-2023');
    });

    it('sendFoundMessage should call sendFoundMessage from gameHelper', () => {
        gameService.sendFoundMessage();
        expect(gameHelperServiceSpy.sendFoundMessage).toHaveBeenCalled();
    });

    it('sendErrorMessage should call sendErrorMessage from gameHelper', () => {
        gameService.sendErrorMessage();
        expect(gameHelperServiceSpy.sendErrorMessage).toHaveBeenCalled();
    });

    it('startPenaltyTimer should toggle errorPenalty after a timeout', fakeAsync(() => {
        gameService.errorPenalty = true;
        gameService.startPenaltyTimer();
        tick(constantsTime.BLINKING_TIME);
        expect(gameService.errorPenalty).toBe(false);
    }));
    it('mouseHitDetect  call sendMousePosition from socketClientService', () => {
        gameService.mouseHitDetect(mouseEvent);
        expect(socketClientServiceSpy.sendMousePosition).toHaveBeenCalled();
    });

    it('giveUp should set hasAbandonedGame to true, call createGameHistory and displayGiveUp from gameHelper ', () => {
        gameService.giveUp();
        expect(gameService.hasAbandonedGame).toBe(true);
        expect(gameDataBaseSpy.createGamingHistory).toHaveBeenCalled();
        expect(gameHelperServiceSpy.displayGiveUp).toHaveBeenCalled();
    });

    it('iconsUpdateForTimeLimit should update the differences array', () => {
        gameService.differencesArray = new Array(3);
        socketClientServiceSpy.nbrDifference = 3;
        socketClientServiceSpy.diffLeft = 2;
        gameService.iconsUpdateForTimeLimit();
        for (let i = 0; i < gameService.totalDifferences; i++) {
            expect(gameService.differencesArray[i]).toEqual(gameHelperServiceSpy.path.differenceNotFound);
        }
        expect(gameService.differencesArray.length).toBe(3);
    });

    it('displayIcons should fill the opponent and player array of differences for multiplayer game mode', () => {
        gameService.gameType = 'double';
        gameService.mode = '';
        gameService.totalDifferences = 3;
        gameService.opponentDifferencesArray = new Array(3);
        gameService.differencesArray = new Array(3);
        gameService.displayIcons();
        for (let i = 0; i < gameService.totalDifferences; i++) {
            expect(gameService.opponentDifferencesArray[i]).toEqual(gameHelperServiceSpy.path.differenceNotFound);
            expect(gameService.differencesArray[i]).toEqual(gameHelperServiceSpy.path.differenceNotFound);
        }
        expect(gameService.opponentDifferencesArray.length).toBe(3);
        expect(gameService.differencesArray.length).toBe(3);
    });

    it('reinitializeGame should reinitialize some game values', () => {
        gameService.opponentDifferencesArray = new Array(3);
        gameService.differencesArray = new Array(3);
        gameService.isWinner = true;
        gameService.hasAbandonedGame = true;
        gameService.reinitializeGame();
        expect(gameService.opponentDifferencesArray.length).toBe(0);
        expect(gameService.differencesArray.length).toBe(0);
        expect(gameService.isWinner).toBe(false);
        expect(gameService.hasAbandonedGame).toBe(false);
    });

    it('handleDifferenceFound should call handleMultiDifference for multi mode', () => {
        gameService.gameType = 'double';
        const handleMultiDifferenceSpy = spyOn(gameService, 'handleMultiDifference');
        gameService.handleDifferenceFound();
        expect(handleMultiDifferenceSpy).toHaveBeenCalled();
    });

    it('handleDifferenceFound should call handleSoloDifference for solo game mode', () => {
        const handleSoloDifferenceSPy = spyOn(gameService, 'handleSoloDifference');
        gameService.handleDifferenceFound();
        expect(handleSoloDifferenceSPy).toHaveBeenCalled();
    });

    it('should returns an array of sets containing the number values from the input strings', () => {
        const differencesStr = [constTest.FIRST_DIFF, constTest.SECOND_DIFF, constTest.THIRD_DIFF];
        const expectedResult = [new Set(constTest.FIRST_SET), new Set(constTest.SECOND_SET), new Set(constTest.THIRD_SET)];
        expect(gameService.getSetDifference(differencesStr)).toEqual(expectedResult);
    });

    it('handleMultiDifference should end the game when conditions are met and call findDifference from socketService', () => {
        gameService.mode = '';
        gameService.gameType = 'double';
        spyOn(gameService, 'multiGameEnd').and.returnValue(true);
        gameService.handleMultiDifference();
        expect(socketClientServiceSpy.findDifference).toHaveBeenCalled();
    });

    it('handleDisconnect should call display ended and set hasAbandonedGame to true', () => {
        socketClientServiceSpy.isPlaying = false;
        gameService.gameType = 'double';
        const displayGameEndedSpy = spyOn(gameService, 'displayGameEnded');
        gameService.handleDisconnect();
        expect(displayGameEndedSpy).toHaveBeenCalled();
        expect(gameService.hasAbandonedGame).toBe(true);
    });

    it('initRewind should call displayIcons end set up totalDifferences, opponentArray, messageList and differenceArray', () => {
        gameService.gameInformation.nDifferences = 3;
        gameService.opponentDifferencesArray = new Array(3);
        gameService.differencesArray = new Array(3);
        socketClientServiceSpy.messageList = [];
        spyOn(gameService, 'displayIcons');
        gameService.initRewind();
        expect(gameService.displayIcons).toHaveBeenCalled();
        expect(gameService.totalDifferences).toBe(3);
        expect(gameService.opponentDifferencesArray.length).toBe(3);
        expect(gameService.differencesArray.length).toBe(3);
        expect(socketClientServiceSpy.messageList.length).toBe(0);
    });

    it('handleSoloDifference should end the game if conditions met', () => {
        const reinitializeGameSpy = spyOn(gameService, 'reinitializeGame');
        spyOn(gameService, 'soloEndConditionReached').and.returnValue(true);
        gameService.handleSoloDifference();
        expect(gameService.soloEndConditionReached).toHaveBeenCalled();
        expect(reinitializeGameSpy).toHaveBeenCalled();
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

    it('multiGameEnd should return false if totalDifference is odd and nDifferencesFound not equal to (totalDifferences+1 )/2', () => {
        gameService.totalDifferences = 5;
        gameService.nDifferencesFound = 2;
        const result = gameService.multiGameEnd();
        expect(result).toBe(false);
    });

    it('deleteGame should call deleteGame from gameDatabase with correct parameter', () => {
        gameService.deleteGame('game');
        expect(gameCardHandlerServiceSpy.handleDelete).toHaveBeenCalled();
        expect(gameDataBaseSpy.deleteGame).toHaveBeenCalledWith('game');
    });

    it('deleteOneGameRecords should call deleteOneGameRecords from gameDataBaseService', () => {
        gameService.deleteOneGameRecords('game');
        expect(gameDataBaseSpy.deleteOneGameRecords).toHaveBeenCalled();
    });
});
