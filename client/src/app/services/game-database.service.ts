import { HttpClient, HttpResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { Game, GameInfo, GameRecord } from '@common/game';
import { CanvasHolderService } from './canvas-holder.service';
import { ImageDiffService } from './image-diff.service';
@Injectable({
    providedIn: 'root',
})
export class GameDatabaseService {
    twoHundredOkResponse: number;

    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient, private readonly imageDiff: ImageDiffService, private readonly canvasHolder: CanvasHolderService) {
        this.twoHundredOkResponse = 200;
    }

    getAllGames(): Observable<GameInfo[]> {
        return this.http.get<GameInfo[]>(`${this.baseUrl}/game`);
    }

    getGameByName(gameName: string): Observable<GameInfo> {
        return this.http.get<GameInfo>(`${this.baseUrl}/game/${gameName}`);
    }

    createGameRecord(gameRecord: GameRecord): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/gameRecord/create`, gameRecord, { observe: 'response', responseType: 'text' });
    }

    createGame(game: Game): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/game/create`, game, { observe: 'response', responseType: 'text' });
    }

    async validateGameName(gameName: string): Promise<Observable<boolean>> {
        return this.http.get<boolean>(`${this.baseUrl}/game/validate/${gameName}`);
    }

    deleteGame(gameName: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/game/${gameName}`, { observe: 'response', responseType: 'text' });
    }

    saveGame(_gameName: string): EventEmitter<boolean> {
        const game: Game = {
            gameName: _gameName,
            originalImageData: this.canvasHolder.getCanvasUrlData(this.canvasHolder.originalCanvas),
            modifiedImageData: this.canvasHolder.getCanvasUrlData(this.canvasHolder.modifiedCanvas),
            listDifferences: this.imageDiff.listDifferences.map((set) => Array.from(set).join(',')),
            difficulty: this.imageDiff.getDifficulty(),
        };
        const isSaved: EventEmitter<boolean> = new EventEmitter<boolean>();
        this.createGame(game).subscribe({
            next: () => isSaved.next(true),
            error: () => isSaved.next(false),
        });
        return isSaved;
    }
}
