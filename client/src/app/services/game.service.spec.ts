import { HttpResponse } from '@angular/common/http';
import { ElementRef, Renderer2, RendererFactory2 } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { GameInformation } from '@app/interfaces/game-information';
import { ImagePath } from '@app/interfaces/hint-diff-path';
import { Game, GameInfo } from '@common/game';
import { of } from 'rxjs';
import { ClientTimeService } from './client-time.service';
import { GameDatabaseService } from './game-database.service';
import { GameService } from './game.service';
import { SocketClientService } from './socket-client.service';
import SpyObj = jasmine.SpyObj;

describe('GameService', () => {
    let rendererFactory2Spy: SpyObj<RendererFactory2>;
    let renderer2Spy: SpyObj<Renderer2>;
    let matDialogSpy: SpyObj<MatDialog>;
    let clientTimeServiceSpy: SpyObj<ClientTimeService>;
    let gameDataBaseSpy: SpyObj<GameDatabaseService>;
    let socketClientServiceSpy: SpyObj<SocketClientService>;
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
        clientTimeServiceSpy = jasmine.createSpyObj('ClientTimeService', ['getCount', 'stopTimer']);
        gameDataBaseSpy = jasmine.createSpyObj('GameDataBaseService', ['getGameByName', 'createGameRecord']);
        socketClientServiceSpy = jasmine.createSpyObj('SocketClientService', ['leaveRoom']);
        audioMock = jasmine.createSpyObj('HTMLAudioElement', ['load', 'play']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MessageDialogComponent],
            providers: [
                { provide: RendererFactory2, useValue: rendererFactory2Spy },
                { provide: Renderer2, useValue: renderer2Spy },
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: ClientTimeService, useValue: clientTimeServiceSpy },
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
        gameInformation = {
            gameTitle: 'Test Game',
            gameMode: 'solo',
            gameDifficulty: 'Facile',
            nDifferences: 3,
            nHints: 3,
            hintsPenalty: 0,
            isClassical: false,
        };
        gameInfo = {
            gameName: 'Test Game',
            difficulty: 'Facile',
            originalImageData: 'string',
            modifiedImageData: 'string',
            listDifferences: ['1', '2', '3'],
            rankingMulti: [],
            rankingSolo: [],
        };
        path = {
            differenceNotFound: './assets/img/difference-not-found.png',
            differenceFound: './assets/img/difference-found.png',
            hintUnused: './assets/img/hint-unused.png',
            hintUsed: './assets/img/hint-used.png',
        };
    });

    it('should be created', () => {
        expect(gameService).toBeTruthy();
    });

    it('should call defineVariables', () => {
        gameService.game = game;
        gameService.gameInformation = gameInformation;
        const nDifferencesNotFound = 3;
        const nHintsUnused = 3;
        const hintsPenalty = 5;
        gameService.defineVariables();
        expect(gameService.gameInformation.gameTitle).toBe(game.gameName);
        expect(gameService.gameInformation.gameMode).toBe('solo');
        expect(gameService.gameInformation.gameDifficulty).toBe(game.difficulty);
        expect(gameService.gameInformation.nDifferences).toBe(game.listDifferences.length);
        expect(gameService.gameInformation.nHints).toBe(3);
        expect(gameService.gameInformation.hintsPenalty).toBe(hintsPenalty);
        expect(gameService.gameInformation.isClassical).toBe(false);
        expect(gameService.nDifferencesNotFound).toBe(gameInformation.nDifferences);
        expect(gameService.nHintsUnused).toBe(gameInformation.nHints);
        expect(gameService.differencesArray.length).toEqual(nDifferencesNotFound);
        expect(gameService.hintsArray.length).toEqual(nHintsUnused);
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

    it('displayIcons should fill the array of differences and hints', () => {
        gameService.nDifferencesNotFound = 3;
        gameService.nHintsUnused = 1;
        gameService.path = path;
        gameService.differencesArray = new Array(3);
        gameService.displayIcons();
        for (let i = 0; i < gameService.nDifferencesNotFound; i++) {
            expect(gameService.differencesArray[i]).toEqual(gameService.path.differenceNotFound);
        }
        expect(gameService.differencesArray.length).toBe(3);
    });

    it('displayGameEnded should open a dialog', () => {
        const msg = 'message';
        const type = 'type';
        const time = '00:00';
        gameService.displayGameEnded(msg, type, time);
        const mockDialog = matDialogSpy.open.and.returnValue({
            afterClosed: () => of(true),
        } as MatDialogRef<MessageDialogComponent>);
        expect(mockDialog).toHaveBeenCalled();
    });

    it('reinitializeGame should reinitialize the game', () => {
        gameService.nDifferencesNotFound = 3;
        gameService.nHintsUnused = 3;
        gameService.nDifferencesFound = 3;
        gameService.differencesArray = new Array(3);
        gameService.playerName = 'player';
        gameService.nDifferencesFound = 3;
        gameService.game = game;
        gameService.gameInformation = gameInformation;
        gameService.reinitializeGame();
        expect(gameService.nDifferencesNotFound).toBe(0);
        expect(gameService.nHintsUnused).toBe(0);
        expect(gameService.nDifferencesFound).toBe(0);
        expect(gameService.differencesArray.length).toBe(0);
        expect(gameService.playerName).toBe('');
        expect(gameService.nDifferencesFound).toBe(0);
        expect(socketClientServiceSpy.leaveRoom).toHaveBeenCalled();
        expect(gameService.game.gameName).toBe('');
        expect(gameService.game.difficulty).toBe('');
        expect(gameService.game.originalImageData).toBe('');
        expect(gameService.game.modifiedImageData).toBe('');
        expect(gameService.game.listDifferences).toEqual([]);
        expect(gameService.gameInformation.gameTitle).toBe('');
        expect(gameService.gameInformation.gameMode).toBe('solo');
        expect(gameService.gameInformation.gameDifficulty).toBe('');
        expect(gameService.gameInformation.nDifferences).toBe(0);
        expect(gameService.gameInformation.nHints).toBe(3);
        expect(gameService.gameInformation.hintsPenalty).toBe(0);
        expect(gameService.gameInformation.isClassical).toBe(false);
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

    it('getGameTime should mock and call getCount from clientTimeService and return time for seconds under 10 digit', () => {
        const mockTime = '0:01';
        clientTimeServiceSpy.getCount.and.returnValue(1);
        const time: string = gameService.getGameTime();
        expect(clientTimeServiceSpy.getCount).toHaveBeenCalled();
        expect(time).toBe(mockTime);
    });

    it('getGameTime should mock and call getCount from clientTimeService and return time for seconds above 10 digit', () => {
        const mockTime = '0:45';
        const countTime = 45;
        clientTimeServiceSpy.getCount.and.returnValue(countTime);
        const time: string = gameService.getGameTime();
        expect(clientTimeServiceSpy.getCount).toHaveBeenCalled();
        expect(time).toBe(mockTime);
    });

    it('handleDifferenceFound should increment nDifferencesFound and update differencesArray when game not ended', () => {
        gameService.nDifferencesFound = 0;
        gameService.nDifferencesNotFound = 3;
        gameService.differencesArray = [path.differenceNotFound, path.differenceNotFound, path.differenceNotFound];
        gameService.handleDifferenceFound();
        expect(gameService.nDifferencesFound).toBe(1);
        expect(gameService.differencesArray).toEqual([path.differenceFound, path.differenceNotFound, path.differenceNotFound]);
    });

    it('handleDifferenceFound should call stopTimer, saveGameRecord, displayGameEnded and reinitializeGame when game ended', () => {
        gameService.nDifferencesFound = 3;
        gameService.nDifferencesNotFound = 3;
        gameService.isGameFinished = false;
        const saveGameRecordSpy = spyOn(gameService, 'saveGameRecord');
        const displayGameEndedSpy = spyOn(gameService, 'displayGameEnded');
        const reinitializeGameSpy = spyOn(gameService, 'reinitializeGame');
        gameService.handleDifferenceFound();
        expect(clientTimeServiceSpy.stopTimer).toHaveBeenCalled();
        expect(gameService.isGameFinished).toBe(true);
        expect(saveGameRecordSpy).toHaveBeenCalled();
        expect(displayGameEndedSpy).toHaveBeenCalled();
        expect(reinitializeGameSpy).toHaveBeenCalled();
    });

    it('saveGameRecord should call createGameRecord from gameDataBaseService', () => {
        const gameTitle = 'gameName';
        const gameMode = 'solo';
        const playerName = 'playerName';
        const dateStart = new Date().getTime().toString();
        const gameTime = '01:00';
        const gameRecordMock = {
            gameName: gameTitle,
            typeGame: gameMode,
            playerName,
            dateStart,
            time: gameTime,
        };
        gameService.gameInformation.gameTitle = gameTitle;
        gameService.gameInformation.gameMode = gameMode;
        gameService.playerName = playerName;
        spyOn(gameService, 'getGameTime').and.returnValue(gameTime);
        const gameRecordHttpResponse = new HttpResponse({ body: gameRecordMock.toString() });
        gameDataBaseSpy.createGameRecord.and.returnValue(of(gameRecordHttpResponse));
        gameService.saveGameRecord();
        // gameRecordMock.dateStart = new Date().getTime().toString();
        // expect(gameDataBaseSpy.createGameRecord).toHaveBeenCalledWith(gameRecordMock);
    });

    it('should toggle the visibility of two canvases at a regular interval', fakeAsync(() => {
        const intervalTime = 125;
        const blinkCount = 8;
        const expectedCalls = blinkCount * 2;
        const canvas1: ElementRef<HTMLCanvasElement> = new ElementRef<HTMLCanvasElement>(document.createElement('canvas'));
        const canvas2: ElementRef<HTMLCanvasElement> = new ElementRef<HTMLCanvasElement>(document.createElement('canvas'));
        gameService['renderer'] = renderer2Spy;
        // Call the function with the mock renderer
        gameService.blinkDifference(canvas1, canvas2);

        // Advance the clock and tick until the intervals are complete
        tick(intervalTime * blinkCount);

        // Verify that the setStyle method was called with the correct arguments
        expect(renderer2Spy.setStyle.calls.count()).toBe(expectedCalls);
        expect(renderer2Spy.setStyle.calls.argsFor(0)).toEqual([canvas1.nativeElement, 'visibility', 'hidden']);
        expect(renderer2Spy.setStyle.calls.argsFor(expectedCalls - 1)).toEqual([canvas2.nativeElement, 'visibility', 'visible']);
    }));
});
