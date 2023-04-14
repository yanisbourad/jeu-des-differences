/* eslint-disable max-lines */
import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MouseButton } from '@app/components/play-area/play-area.component';
import * as constants from '@app/configuration/const-canvas';
import * as constantsTime from '@app/configuration/const-time';
import { GameInformation } from '@app/interfaces/game-information';
import { Message } from '@app/interfaces/message';
import { Vec2 } from '@app/interfaces/vec2';
import { GameDatabaseService } from '@app/services/game/game-database.service';
import { SocketClientService } from '@app/services/socket/socket-client.service';
import { Game, GameRecord, GamingHistory, Rankings } from '@common/game';
import { Observable } from 'rxjs';
import { GameCardHandlerService } from './game-card-handler-service.service';
import { GameHelperService } from './game-helper.service';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    rankingSoloCopy: GameRecord[];
    rankingMultiCopy: GameRecord[];
    game: Game;
    gameInformation: GameInformation;
    totalDifferences: number;
    nDifferencesFound: number;
    differencesArray: string[];
    opponentDifferencesArray: string[];
    playerName: string;
    playersName: string[];
    gameTime: number;
    gameType: string;
    opponentName: string;
    gameId: string;
    gameName: string;
    mode: string;
    diff: Set<number>;
    mousePosition: Vec2;
    errorPenalty: boolean;
    isWinner: boolean;
    startDate: string;
    hasAbandonedGame: boolean;

    // eslint-disable-next-line max-params
    constructor(
        private readonly gameCardHandlerService: GameCardHandlerService,
        private gameDataBase: GameDatabaseService,
        private socket: SocketClientService,
        private gameHelper: GameHelperService,
    ) {
        this.gameInformation = {
            gameTitle: '',
            gameMode: '',
            gameDifficulty: '',
            nDifferences: 0,
        };
        this.nDifferencesFound = 0;
        this.mousePosition = { x: 0, y: 0 };
        this.errorPenalty = false;
        this.isWinner = false;
        this.startDate = '';
        this.hasAbandonedGame = false;
    }

    get width(): number {
        return constants.DEFAULT_WIDTH;
    }

    defineVariables(): void {
        if (this.game) {
            this.gameInformation = {
                gameTitle: this.game.gameName,
                gameMode: this.gameType,
                gameDifficulty: this.game.difficulty,
                nDifferences: this.game.listDifferences.length,
            };
            this.totalDifferences = this.gameInformation.nDifferences;
        }
        if (this.mode) this.totalDifferences = this.socket.nbrDifference;
        this.differencesArray = new Array(this.totalDifferences);
        this.opponentDifferencesArray = new Array(this.totalDifferences);
        this.playersName = [this.playerName, this.opponentName];
        this.gameHelper.gameName = this.gameName;
        this.gameHelper.gameType = this.gameType;
        this.gameHelper.playerName = this.playerName;
        this.gameHelper.subMessage = {
            playerName: this.playerName,
            color: '#00FF00',
            pos: '50%',
            gameId: this.socket.getRoomName(),
            event: true,
        };
    }

    getSetDifference(differencesStr: string[]): Set<number>[] {
        return differencesStr.map((a: string) => new Set(a.split(',').map((b: string) => Number(b))));
    }

    getTimeLimitGame(): void {
        setTimeout(() => {
            this.game = this.socket.getGame();
            this.defineVariables();
            this.displayIcons();
        }, constantsTime.LOADING_TIMEOUT);
    }

    getClassicGame(gameName: string): void {
        this.gameDataBase.getGameByName(gameName).subscribe((res) => {
            this.game = res;
            this.defineVariables();
            this.displayIcons();
        });
    }

    initRewind(): void {
        this.totalDifferences = this.gameInformation.nDifferences;
        this.differencesArray = new Array(this.totalDifferences);
        this.opponentDifferencesArray = new Array(this.totalDifferences);
        this.displayIcons();
        this.socket.messageList = [];
    }

    displayIcons(): void {
        if (this.gameType === 'solo') this.setIcons();
        if (this.gameType === 'double' && this.mode) this.setIcons();
        if (this.gameType === 'double' && !this.mode) {
            for (let i = 0; i < this.totalDifferences; i++) {
                this.differencesArray[i] = this.gameHelper.path.differenceNotFound;
                this.opponentDifferencesArray[i] = this.gameHelper.path.differenceNotFound;
            }
        }
    }

    setIcons(): void {
        for (let i = 0; i < this.totalDifferences; i++) {
            this.differencesArray[i] = this.gameHelper.path.differenceNotFound;
        }
    }

    iconsUpdateForTimeLimit(): void {
        const diffFound = this.socket.nbrDifference - this.socket.diffLeft;
        for (let i = 0; i < diffFound; i++) {
            this.differencesArray.pop();
            this.differencesArray.unshift(this.gameHelper.path.differenceFound);
        }
    }

    displayGameEnded(msg: string, type: string, time?: string) {
        this.gameHelper.displayGameEnded(msg, type, time);
    }

    setStartDate(date: string): void {
        this.startDate = date;
    }

    reinitializeGame(): void {
        this.totalDifferences = 0;
        this.differencesArray = [];
        this.opponentDifferencesArray = [];
        this.isWinner = false;
        this.startDate = '';
        this.hasAbandonedGame = false;
        this.gameId = '';
        this.nDifferencesFound = 0;
        this.socket.messageList = [];
        this.mode = '';
        this.socket.isPlaying = false;
    }

    reduceNbrDifferences(): void {
        this.nDifferencesFound++;
        this.differencesArray.pop();
        this.differencesArray.unshift(this.gameHelper.path.differenceFound);
    }

    handleDifferenceFound(): void {
        switch (this.gameType) {
            case 'solo':
                this.handleSoloDifference();
                break;
            case 'double':
                this.handleMultiDifference();
                break;
            default:
                break;
        }
    }

    handleMultiDifference(): void {
        this.socket.findDifference({ playerName: this.playerName, roomName: this.socket.getRoomName() });
        if (this.multiGameEnd() && !this.mode) {
            this.endGame();
        }
    }

    handleSoloDifference(): void {
        if (this.nDifferencesFound === this.totalDifferences && !this.mode) {
            this.endGame();
        }
    }

    // totalDifferenceReached(): boolean {
    //     return this.nDifferencesFound === this.totalDifferences;
    // }

    handleDisconnect(): void {
        if (!this.socket.isPlaying && this.gameType === 'double') {
            this.displayGameEnded("vous avez été déconnecté du jeu, vous allez être redirigé vers la page d'accueil", 'finished');
            this.hasAbandonedGame = true;
        }
    }

    handlePlayerDifference() {
        this.opponentDifferencesArray.pop();
        this.opponentDifferencesArray.unshift(this.gameHelper.path.differenceFound);
    }

    multiGameEnd(): boolean {
        this.isWinner = true;
        if (this.totalDifferences % 2 === 0) return this.nDifferencesFound === this.totalDifferences / 2;
        // winning multiplayer game with an odd total number of difference
        return this.nDifferencesFound === (this.totalDifferences + 1) / 2;
    }

    sendFoundMessage(): Message {
        return this.gameHelper.sendFoundMessage();
    }

    sendErrorMessage(): Message {
        return this.gameHelper.sendErrorMessage();
    }

    deleteGame(gameName: string): Observable<HttpResponse<string>> {
        this.gameCardHandlerService.handleDelete(gameName);
        return this.gameDataBase.deleteGame(gameName);
    }

    startPenaltyTimer(): void {
        this.errorPenalty = true;
        setTimeout(() => {
            this.errorPenalty = false;
        }, constantsTime.BLINKING_TIME);
    }

    giveUp(): void {
        this.hasAbandonedGame = true;
        this.saveGameRecord();
        this.gameHelper.displayGiveUp('Êtes-vous sûr de vouloir abandonner la partie? Cette action est irréversible.', 'giveUp');
    }

    deleteOneGameRecords(gameName: string): Observable<Rankings> {
        return this.gameDataBase.deleteOneGameRecords(gameName);
    }

    mouseHitDetect(event: MouseEvent): void {
        const roomName = this.gameId + this.gameName;
        if (event.button === MouseButton.Left && !this.errorPenalty) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            const distMousePosition: number = this.mousePosition.x + this.mousePosition.y * this.width;
            this.socket.sendMousePosition(distMousePosition, roomName, this.mode);
        }
    }

    private endGame(): void {
        this.socket.stopTimer(this.socket.getRoomName(), this.playerName);
        this.gameTime = this.socket.getRoomTime(this.socket.getRoomName());
        this.saveGameRecord();
        this.displayGameEnded('Félicitation, vous avez terminée la partie', 'finished', this.gameHelper.getGameTime(this.gameTime));
        if (this.gameType === 'solo') {
            this.gameHelper.globalMessage(this.gameTime, this.rankingSoloCopy);
        } else {
            this.gameHelper.globalMessage(this.gameTime, this.rankingMultiCopy);
        }
        this.socket.gameEnded(this.socket.getRoomName());
        this.reinitializeGame();
    }

    private saveGameRecord(): void {
        const gameRecord: GameRecord = {
            gameName: this.gameInformation.gameTitle,
            typeGame: this.gameType === 'double' ? 'multi' : 'solo',
            playerName: this.playerName,
            dateStart: this.startDate,
            time: this.gameHelper.getGameTime(this.gameTime),
            keyServer: '',
        };
        const gamingHistory: GamingHistory = {
            gameName: this.gameInformation.gameTitle,
            gameType: this.gameType === 'double' ? 'multi' : 'solo',
            playerName: this.playerName,
            dateStart: this.startDate,
            time: this.gameHelper.getGameTime(this.gameTime),
            opponentName: this.gameType === 'double' ? this.opponentName : '999999999999999',
            hasAbandonedGame: this.hasAbandonedGame,
        };
        this.gameDataBase.createGameRecord(gameRecord).subscribe();
        if (this.gameType === 'solo' || this.isWinner) {
            this.gameDataBase.createGamingHistory(gamingHistory).subscribe();
        }
    }

}
