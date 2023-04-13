import { HttpClient, HttpResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { CanvasHolderService } from '@app/services/canvas-holder/canvas-holder.service';
import { ImageDiffService } from '@app/services/image-diff/image-diff.service';
import { Game, GameInfo, GameRecord, GamingHistory, Rankings, TimeConfig } from '@common/game';
@Injectable({
    providedIn: 'root',
})
export class GameDatabaseService {
    twoHundredOkResponse: number;
    isEmpty: boolean = false;

    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient, private readonly imageDiff: ImageDiffService, private readonly canvasHolder: CanvasHolderService) {
        this.twoHundredOkResponse = 200;
    }

    getAllGames(): Observable<GameInfo[]> {
        return this.http.get<GameInfo[]>(`${this.baseUrl}/game`);
    }

    getAllGamingHistory(): Observable<GamingHistory[]> {
        return this.http.get<GamingHistory[]>(`${this.baseUrl}/gamingHistory`);
    }

    getGameByName(gameName: string): Observable<GameInfo> {
        return this.http.get<GameInfo>(`${this.baseUrl}/game/${gameName}`);
    }

    createGameRecord(gameRecord: GameRecord): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/gameRecord/create`, gameRecord, { observe: 'response', responseType: 'text' });
    }
    createGamingHistory(gamingHistory: GamingHistory): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/gamingHistory/create`, gamingHistory, { observe: 'response', responseType: 'text' });
    }

    createGame(game: Game): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/game/create`, game, { observe: 'response', responseType: 'text' });
    }

    async validateGameName(gameName: string): Promise<Observable<boolean>> {
        return this.http.get<boolean>(`${this.baseUrl}/game/validate/${gameName}`);
    }

    deleteAllGames(): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/game/`, { observe: 'response', responseType: 'text' });
    }

    deleteGame(gameName: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/game/${gameName}`, { observe: 'response', responseType: 'text' });
    }
    deleteOneGameRecords(gameName: string): Observable<Rankings> {
        return this.http.delete<Rankings>(`${this.baseUrl}/gameRecord/${gameName}`);
    }
    deleteGamingHistory(): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/gamingHistory`, { observe: 'response', responseType: 'text' });
    }
    deleteGameRecords(): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/gameRecord`, { observe: 'response', responseType: 'text' });
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
    async isDataBaseEmpty(): Promise<void> {
        this.getAllGames().subscribe((res: GameInfo[]) => {
            if (res.length === 0) {
                this.isEmpty = true;
            }
        });
    }

    updateConstants(constants: TimeConfig): Observable<HttpResponse<string>> {
        return this.http.put(`${this.baseUrl}/game/constants`, constants, { observe: 'response', responseType: 'text' });
    }

    getConstants(): Observable<TimeConfig> {
        return this.http.get<TimeConfig>(`${this.baseUrl}/game/constants`);
    }
}
