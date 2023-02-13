import { RendererFactory2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { GameInformation } from '@app/interfaces/game-information';
import { ImagePath } from '@app/interfaces/hint-diff-path';
import { SocketClientService } from './socket-client.service';
import { Game } from '@common/game';
import { GameDatabaseService } from './game-database.service';
import { ClientTimeService } from './client-time.service';

import { GameService } from './game.service';
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
    let nDifferencesNotFound: number;
    let nDifferencesFound: number;
    let differencesArray: string[];
    let isGameFinished: boolean;
    let nHintsUnused: number;
    let nHintsUsed: number;
    let hintsArray: string[];
    let playerName: string;

    beforeEach(() => {
        rendererFactory2Spy = jasmine.createSpyObj('RendererFactory2', ['createRenderer']);
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        clientTimeServiceSpy = jasmine.createSpyObj('ClientTimeService', ['']);
        gameDataBaseSpy = jasmine.createSpyObj('GameDataBaseService', ['']);
        socketClientServiceSpy = jasmine.createSpyObj('SocketClientService', ['']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: RendererFactory2, useValue: rendererFactory2Spy },
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: ClientTimeService, useValue: clientTimeServiceSpy },
                { provide: GameDatabaseService, useValue: gameDataBaseSpy },
                { provide: SocketClientService, useValue: socketClientServiceSpy },
            ],
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
            nHints: 0,
            hintsPenalty: 0,
            isClassical: false,
        };
    });

    it('should be created', () => {
        expect(gameService).toBeTruthy();
    });
});
