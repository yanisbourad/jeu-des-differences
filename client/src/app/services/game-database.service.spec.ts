import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import * as constantes from '@app/configuration/const-test';
import { Game, GameInfo, GameRecord } from '@common/game';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CanvasHolderService } from './canvas-holder.service';
import { GameDatabaseService } from './game-database.service';
import { ImageDiffService } from './image-diff.service';

describe('GameDatabaseService', () => {
    let service: GameDatabaseService;
    let httpTestingController: HttpTestingController;
    let canvasHolderService: CanvasHolderService;
    let imageDiffService: ImageDiffService;
    const baseUrl = environment.serverUrl;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        httpTestingController = TestBed.inject(HttpTestingController);
        canvasHolderService = TestBed.inject(CanvasHolderService);
        imageDiffService = TestBed.inject(ImageDiffService);
        service = TestBed.inject(GameDatabaseService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get game list', () => {
        const data: GameInfo[] = [];
        service.getAllGames().subscribe((games) => {
            expect(games).toEqual(data);
        });
        httpTestingController.expectOne(`${baseUrl}/game`).flush(data);
    });

    it('should get game by name', () => {
        const data: GameInfo = {
            gameName: 'test',
            originalImageData: 'test',
            modifiedImageData: 'test',
            listDifferences: ['test'],
            difficulty: 'Facile',
            rankingMulti: [],
            rankingSolo: [],
        };
        service.getGameByName('test').subscribe((game) => {
            expect(game).toEqual(data);
        });
        const req = httpTestingController.expectOne(`${baseUrl}/game/test`);
        expect(req.request.method).toEqual('GET');
        expect(req.request.responseType).toEqual('json');
        expect(req.request.body).toBeNull();
        req.flush(data);
    });

    it('should create game', () => {
        const data: Game = {
            gameName: 'test',
            originalImageData: 'test',
            modifiedImageData: 'test',
            listDifferences: ['test'],
            difficulty: 'Facile',
        };
        service.createGame(data).subscribe((game) => {
            expect(game.ok).toEqual(true);
        });
        httpTestingController.expectOne(`${baseUrl}/game/create`).flush(data);
    });

    it('should create game record', () => {
        const data: GameRecord = {
            gameName: 'string',
            typeGame: 'string',
            time: 'String',
            playerName: 'string',
            dateStart: 'string',
        };
        service.createGameRecord(data).subscribe((res) => {
            expect(res.ok).toEqual(true);
        });
        httpTestingController.expectOne({ method: 'POST', url: `${baseUrl}/gameRecord/create` }).flush('true');
    });

    it('should validate game name', async () => {
        const data = true;
        (await service.validateGameName('test')).subscribe((game) => {
            expect(game).toEqual(data);
        });
        httpTestingController.expectOne(`${baseUrl}/game/validate/test`).flush(data);
    });

    it('should save the game from the canvas holder et imageDiffService and return true', () => {
        const spyGetData = spyOn(canvasHolderService, 'getCanvasUrlData').and.returnValue('testData');
        imageDiffService.listDifferences = [new Set(constantes.SIXTH_SET)];
        const spyDiffDifficulty = spyOn(imageDiffService, 'getDifficulty').and.returnValue('Facile');
        const game: Game = {
            gameName: 'testName',
            originalImageData: 'testData',
            modifiedImageData: 'testData',
            listDifferences: ['1,2,3,4'],
            difficulty: 'Facile',
        };
        const spy = spyOn(service, 'createGame').and.returnValue(of(new HttpResponse({ body: 'true' })));
        service.saveGame('testName').subscribe((saved) => {
            expect(saved).toEqual(true);
        });
        expect(spy).toHaveBeenCalledOnceWith(game);
        expect(spyGetData).toHaveBeenCalledTimes(2);
        expect(spyDiffDifficulty).toHaveBeenCalledTimes(1);
    });

    it('should return false if the game was not saved', () => {
        const spyGetData = spyOn(canvasHolderService, 'getCanvasUrlData').and.returnValue('testData');
        imageDiffService.listDifferences = [new Set(constantes.SIXTH_SET)];
        const spyDiffDifficulty = spyOn(imageDiffService, 'getDifficulty').and.returnValue('Facile');
        const game: Game = {
            gameName: 'test',
            originalImageData: 'testData',
            modifiedImageData: 'testData',
            listDifferences: ['1,2,3,4'],
            difficulty: 'Facile',
        };
        const spy = spyOn(service, 'createGame').and.returnValue(of(new HttpResponse({ body: 'false', status: 400 })));
        service.saveGame('test').subscribe((saved) => {
            expect(saved).toEqual(false);
        });
        expect(spyGetData).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalledOnceWith(game);
        expect(spyDiffDifficulty).toHaveBeenCalledTimes(1);
    });

    describe('deleteGame', () => {
        it('should delete game', () => {
            const gameName = 'test';

            service.deleteGame(gameName).subscribe((response) => {
                expect(response.status).toEqual(200);
                expect(response.body).toEqual('Successfully deleted game');
            });

            const req = httpMock.expectOne(`${baseUrl}/game/${gameName}`);
            expect(req.request.method).toBe('DELETE');

            req.flush('Successfully deleted game', { status: 200, statusText: 'OK' });
        });
    });
});
