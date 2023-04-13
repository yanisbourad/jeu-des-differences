/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameMessageEvent } from '@app/classes/game-records/message-event';
import { GiveUpMessagePopupComponent } from '@app/components/give-up-message-popup/give-up-message-popup.component';
import { SocketClient } from '@app/utils/socket-client';
import { Game } from '@common/game';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    game: Game;
    roomName: string;
    playerGaveUp: string;
    statusPlayer: string;
    error: Set<number>;
    nbrDifference: number;
    diffLeft: number;
    elapsedTimes: Map<string, number> = new Map<string, number>();
    messageList: { message: string; playerName: string; mine: boolean; color: string; pos: string; event: boolean }[] = [];
    // DEFINE SUBJECTS
    private gameState = new Subject<boolean>();
    private playerFoundDiff = new Subject<string>();
    private diffFound = new Subject<Set<number>>();
    private difference = new Subject<Set<number>>();
    private timeLimitStatus = new Subject<boolean>();
    private teammateStatus = new Subject<boolean>();
    private messageToAdd = new Subject<GameMessageEvent>();
    private imageLoaded = new Subject<Game>();
    // DEFINE OBSERVABLES
    gameState$ = this.gameState.asObservable();
    playerFoundDiff$ = this.playerFoundDiff.asObservable();
    diffFound$ = this.diffFound.asObservable();
    difference$ = this.difference.asObservable();
    timeLimitStatus$ = this.timeLimitStatus.asObservable();
    messageToAdd$ = this.messageToAdd.asObservable();
    teammateStatus$ = this.teammateStatus.asObservable();
    imageLoaded$ = this.imageLoaded.asObservable();

    constructor(private readonly socketClient: SocketClient, public dialog: MatDialog) {}

    get socketId() {
        return this.socketClient.socket.id ? this.socketClient.socket.id : '';
    }

    set gameTime(gameTime: number) {
        this.elapsedTimes.set(this.roomName, gameTime);
    }

    connect() {
        if (!this.socketClient.isSocketAlive()) {
            this.socketClient.connect();
        }
        this.configureBaseSocketFeatures();
    }

    getRoomTime(roomName: string): number {
        return this.elapsedTimes.get(roomName) as number;
    }

    getGame(): Game {
        return this.game;
    }

    getRoomName(): string {
        return this.roomName;
    }

    configureBaseSocketFeatures() {
        this.connectionHandling();
        this.differenceHandling();
        this.timeLimitHandling();
        this.timeAndMessageHandling();
        this.endGameHandling();
    }

    timeAndMessageHandling(): void {
        this.socketClient.on('serverTime', (values: Map<string, number>) => {
            this.elapsedTimes = new Map(values);
        });

        this.socketClient.on('message-return', (data: { message: string; userName: string; color: string; pos: string; event: boolean }) => {
            if (data) {
                this.messageToAdd.next(
                    new GameMessageEvent({
                        message: data.message,
                        playerName: data.userName,
                        mine: false,
                        color: data.color,
                        pos: data.pos,
                        event: data.event,
                    }),
                );
            }
        });
    }

    connectionHandling(): void {
        this.socketClient.on('connect', () => {
            return;
        });

        this.socketClient.on('hello', (socketId: string) => {
            this.roomName = socketId;
        });

        this.socketClient.on('sendRoomName', (values: [string, string]) => {
            if (values[0] === 'multi') {
                this.roomName = values[1];
            }
        });
    }

    differenceHandling(): void {
        this.socketClient.on('nbrDifference', (nbrDifference: number) => {
            this.nbrDifference = nbrDifference;
        });

        this.socketClient.on('nbrDiffLeft', (diffLeft: number) => {
            this.diffLeft = diffLeft;
        });

        this.socketClient.on('diffFound', (diff: Set<number>) => {
            const data = new Set<number>(diff);
            this.difference.next(data);
        });

        this.socketClient.on('findDifference-return', (data: { playerName: string }) => {
            this.playerFoundDiff.next(data.playerName);
        });

        this.socketClient.on('error', () => {
            this.difference.next(this.error);
        });

        this.socketClient.on('feedbackDifference', (diff: Set<number>) => {
            const data = new Set<number>(diff);
            this.diffFound.next(data);
        });
    }

    endGameHandling(): void {
        this.socketClient.on('giveup-return', (data: { playerName: string }) => {
            this.playerGaveUp = data.playerName;
            this.stopTimer(this.getRoomName(), data.playerName);
            const dialog = this.dialog.open(GiveUpMessagePopupComponent, {
                data: { name: this.playerGaveUp },
                disableClose: true,
                width: '544px',
                height: '255px',
            });
            dialog.afterClosed().subscribe(() => {
                this.disconnect();
            });
        });

        this.socketClient.on('gameEnded', (data: [gameEnded: boolean, player: string]) => {
            this.gameState.next(data[0]);
            this.statusPlayer = data[1];
        });
    }

    timeLimitHandling(): void {
        this.socketClient.on('teammateDisconnected', (status: boolean) => {
            this.teammateStatus.next(status);
        });

        this.socketClient.on('timeLimitStatus', (finished: boolean) => {
            this.timeLimitStatus.next(finished);
        });

        this.socketClient.on('getRandomGame', (game: Game) => {
            this.game = game;
            this.imageLoaded.next(game);
        });
    }

    disconnect() {
        this.messageList = [];
        this.socketClient.disconnect();
    }

    gameEnded(roomName: string): void {
        this.socketClient.send('gameEnded', roomName);
    }

    stopTimer(roomName: string, playerName: string) {
        this.socketClient.send('stopTimer', [roomName, playerName]);
    }

    sendGiveUp(information: { playerName: string; roomName: string }) {
        this.socketClient.send('sendGiveUp', information);
    }

    leaveRoom() {
        this.disconnect();
        this.socketClient.send('leaveRoom');
    }
    joinRoomSolo(playerName: string, gameName: string) {
        this.socketClient.send('joinRoomSolo', { playerName, gameName });
    }

    startTimeLimit(playerName: string) {
        this.socketClient.send('startTimeLimit', playerName);
    }

    sendRoomName(roomName: string, mode: string) {
        this.socketClient.send('sendRoomName', [roomName, mode]);
    }

    startMultiGame(player: { gameId: string; creatorName: string; gameName: string; opponentName: string }): void {
        this.socketClient.send('startMultiGame', player);
    }

    startMultiTimeLimit(player: { gameId: string; creatorName: string; gameName: string; opponentName: string; mode: string }): void {
        this.socketClient.send('startMultiTimeLimit', player);
    }

    findDifference(information: { playerName: string; roomName: string }) {
        this.socketClient.send('findDifference', information);
    }

    sendMessage(data: { message: string; playerName: string; color: string; pos: string; gameId: string; event: boolean }) {
        this.socketClient.send('message', [data.message, data.playerName, data.color, data.pos, data.gameId, data.event]);
    }

    sendDifference(diff: Set<number>, roomName: string) {
        this.socketClient.send('feedbackDifference', [Array.from(diff), roomName]);
    }

    // sendGameName(gameName: string) {
    //     this.socketClient.send('currentGameName', gameName);
    // }

    sendMousePosition(pos: number, roomName: string, mode: string) {
        this.socketClient.send('mousePosition', [pos, roomName, mode]);
    }
}
