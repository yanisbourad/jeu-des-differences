import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

// eslint-disable-next-line no-restricted-imports
import { GameCreate, GameInfo } from '../../../../common/game';
import { CanvasHolderService } from './canvas-holder.service';
import { ImageDiffService } from './image-diff.service';
@Injectable({
    providedIn: 'root',
})
export class GameDatabaseService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(
        private readonly http: HttpClient,
        private readonly imageDiff: ImageDiffService,
        private readonly canvaseHolder: CanvasHolderService,
    ) {}

    getAllGames(): Observable<GameInfo[]> {
        return this.http.get<GameInfo[]>(`${this.baseUrl}/game`).pipe(catchError(this.handleError<GameInfo[]>('getAllGames')));
    }

    getGameByName(gameName: string): Observable<GameInfo> {
        return this.http.get<GameInfo>(`${this.baseUrl}/game/${gameName}`).pipe(catchError(this.handleError<GameInfo>('getGameById')));
    }
    createGame(game: GameCreate): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/game/create`, game, { observe: 'response', responseType: 'text' });
    }

    saveGame(_gameName: string) {
        const game: GameCreate = {
            gameName: _gameName,
            originalImageData: this.canvaseHolder.getCanvasUrlData(this.canvaseHolder.originalCanvas),
            modifiedImageData: this.canvaseHolder.getCanvasUrlData(this.canvaseHolder.modifiedCanvas),
            listDifferences: this.imageDiff.getDifferences(),
            difficulty: this.imageDiff.getDifficulty(),
        };
        this.createGame(game).subscribe((response) => {
            if (response.status === 200) {
                alert('Game saved!');
            } else {
                alert('Error: Game not saved!');
            }
        });
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
