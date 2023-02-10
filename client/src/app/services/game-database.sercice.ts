import { HttpClient, HttpResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

// eslint-disable-next-line no-restricted-imports
import { GameCreate, GameInfo, GameRecord } from '../../../../common/game';
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
        return this.http.get<GameInfo[]>(`${this.baseUrl}/game`).pipe(catchError(this.handleError<GameInfo[]>('getAllGames')));
    }

    getGameByName(gameName: string): Observable<GameInfo> {
        return this.http.get<GameInfo>(`${this.baseUrl}/game/${gameName}`).pipe(catchError(this.handleError<GameInfo>('getGameById')));
    }

    createGameRecord(gameRecord: GameRecord): Observable<HttpResponse<string>> {
        console.log(`${this.baseUrl}/gameRecord/create`);
        return this.http.post(`${this.baseUrl}/gameRecord/create`, gameRecord, { observe: 'response', responseType: 'text' });
    }

    createGame(game: GameCreate): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/game/create`, game, { observe: 'response', responseType: 'text' });
    }

    saveGame(_gameName: string): EventEmitter<boolean> {
        const game: GameCreate = {
            gameName: _gameName,
            originalImageData: this.canvasHolder.getCanvasUrlData(this.canvasHolder.originalCanvas),
            modifiedImageData: this.canvasHolder.getCanvasUrlData(this.canvasHolder.modifiedCanvas),
            listDifferences: this.imageDiff.getDifferences(),
            difficulty: this.imageDiff.getDifficulty(),
        };
        const isSaved: EventEmitter<boolean> = new EventEmitter<boolean>();
        try {
            this.createGame(game).subscribe((response) => {
                if (response.status === this.twoHundredOkResponse) {
                    isSaved.emit(true);
                } else {
                    isSaved.emit(false);
                }
            });
        } catch (err) {
            isSaved.emit(false);
        }

        return isSaved;
    }

    deleteGame(gameName: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/game/delete/${gameName}`, { observe: 'response', responseType: 'text' });
    }

    deleteAllGames(): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/game/delete-all`, { observe: 'response', responseType: 'text' });
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
