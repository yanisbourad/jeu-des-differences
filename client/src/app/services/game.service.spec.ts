import { RendererFactory2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { GameInformation } from '@app/interfaces/game-information';
import { ImagePath } from '@app/interfaces/hint-diff-path';
import { Game, GameInfo } from '@common/game';
import { of } from 'rxjs/internal/observable/of';
import { ClientTimeService } from './client-time.service';
import { GameDatabaseService } from './game-database.service';
import { GameService } from './game.service';
import { SocketClientService } from './socket-client.service';
import SpyObj = jasmine.SpyObj;

describe('GameService', () => {
    let rendererFactory2Spy: SpyObj<RendererFactory2>;
    let matDialogSpy: SpyObj<MatDialog>;
    let clientTimeServiceSpy: SpyObj<ClientTimeService>;
    let gameDataBaseSpy: SpyObj<GameDatabaseService>;
    let socketClientServiceSpy: SpyObj<SocketClientService>;
    let gameService: GameService;
    let path: ImagePath;
    let game: Game;
    let gameInformation: GameInformation;
    let gameInfo: GameInfo;
    // let nDifferencesNotFound: number;
    // let nDifferencesFound: number;
    // let differencesArray: string[];
    // let isGameFinished: boolean;
    // let nHintsUnused: number;
    // let nHintsUsed: number;
    // let hintsArray: string[];
    // let playerName: string;

    beforeEach(() => {
        rendererFactory2Spy = jasmine.createSpyObj('RendererFactory2', ['createRenderer']);
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        clientTimeServiceSpy = jasmine.createSpyObj('ClientTimeService', ['']);
        gameDataBaseSpy = jasmine.createSpyObj('GameDataBaseService', ['getGameByName']);
        socketClientServiceSpy = jasmine.createSpyObj('SocketClientService', ['']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MessageDialogComponent],
            providers: [
                { provide: RendererFactory2, useValue: rendererFactory2Spy },
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
            difficulty: 'easy',
            originalImageData: 'string',
            modifiedImageData: 'string',
            listDifferences: ['1', '2', '3'],
        };
        gameInformation = {
            gameTitle: 'Test Game',
            gameMode: 'solo',
            gameDifficulty: 'easy',
            nDifferences: 3,
            nHints: 3,
            hintsPenalty: 0,
            isClassical: false,
        };
        gameInfo = {
            gameName: 'Test Game',
            difficulty: 'easy',
            originalImageData: 'string',
            modifiedImageData: 'string',
            listDifferences: ['1', '2', '3'],
            rankingMulti: [],
            rankingSolo: [],
        };
        path = {
            differenceNotFound: 'differenceNotFound.png',
            differenceFound: 'differenceFound.png',
            hintUnused: 'hintUnused.png',
            hintUsed: 'hintUsed.png',
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
        gameService.defineVariables();
        expect(gameService.gameInformation.gameTitle).toBe(game.gameName);
        expect(gameService.gameInformation.gameMode).toBe('solo');
        expect(gameService.gameInformation.gameDifficulty).toBe(game.difficulty);
        expect(gameService.gameInformation.nDifferences).toBe(game.listDifferences.length);
        expect(gameService.gameInformation.nHints).toBe(3);
        expect(gameService.gameInformation.hintsPenalty).toBe(5);
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
        gameService.hintsArray = new Array(1);
        gameService.displayIcons();
        for (let i = 0; i < gameService.nDifferencesNotFound; i++) {
            expect(gameService.differencesArray[i]).toEqual(gameService.path.differenceNotFound);
        }
        for (let i = 0; i < gameService.nHintsUnused; i++) {
            expect(gameService.hintsArray[i]).toEqual(gameService.path.hintUnused);
        }
        expect(gameService.differencesArray.length).toBe(3);
        expect(gameService.hintsArray.length).toBe(1);
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

});
