import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

// eslint-disable-next-line no-restricted-imports
import { Game } from '../../../../common/game';
@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    getAllGames(): Observable<Game> {
        return this.http.get<Game>(`${this.baseUrl}/game`).pipe(catchError(this.handleError<Game>('getAllGames')));
    }

    getGameById(gameId: string): Observable<Game> {
        return this.http.get<Game>(`${this.baseUrl}/game/${gameId}`).pipe(catchError(this.handleError<Game>('getGameById')));
    }
    createGame(game: Game): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/game/create`, game, { observe: 'response', responseType: 'text' });
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
