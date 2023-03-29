import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameMessageEvent } from '@app/classes/game-records/message-event';
import { GiveUpMessagePopupComponent } from '@app/components/give-up-message-popup/give-up-message-popup.component';
import { SocketClient } from '@app/utils/socket-client';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    roomName: string = '';

    // Mange the message list
    messageList: { message: string; userName: string; mine: boolean; color: string; pos: string; event: boolean }[] = [];
    messageToAdd = new Subject<GameMessageEvent>();
    messageToAdd$ = this.messageToAdd.asObservable();

    elapsedTimes: Map<string, number> = new Map<string, number>();
    playerGaveUp: string;
    statusPlayer: string;
    error: Set<number>;
    private gameState = new Subject<boolean>();
    private playerFoundDiff = new Subject<string>();
    private diffFound = new Subject<Set<number>>();
    private difference = new Subject<Set<number>>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    gameState$ = this.gameState.asObservable();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    playerFoundDiff$ = this.playerFoundDiff.asObservable();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    diffFound$ = this.diffFound.asObservable();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    difference$ = this.difference.asObservable();
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

    getRoomName(): string {
        return this.roomName;
    }

    configureBaseSocketFeatures() {
        this.socketClient.on('connect', () => {
            return;
        });

        this.socketClient.on('hello', (socketId: string) => {
            this.roomName = socketId;
        });

        this.socketClient.on('serverTime', (values: Map<string, number>) => {
            this.elapsedTimes = new Map(values);
        });

        this.socketClient.on('sendRoomName', (values: [string, string]) => {
            if (values[0] === 'multi') {
                this.roomName = values[1];
            }
        });

        this.socketClient.on('message-return', (data: { message: string; userName: string; color: string; pos: string; event: boolean }) => {
            if (data) {
                this.messageToAdd.next(
                    new GameMessageEvent({
                        message: data.message,
                        userName: data.userName,
                        mine: false,
                        color: data.color,
                        pos: data.pos,
                        event: data.event,
                    }),
                );
            }
        });

        this.socketClient.on('gameEnded', (data: [gameEnded: boolean, player: string]) => {
            this.gameState.next(data[0]);
            this.statusPlayer = data[1];
        });

        this.socketClient.on('diffFound', (diff: Set<number>) => {
            const data = new Set<number>(diff);
            this.difference.next(data);
        });
        this.socketClient.on('error', () => {
            this.difference.next(this.error);
        });

        this.socketClient.on('findDifference-return', (data: { playerName: string }) => {
            this.playerFoundDiff.next(data.playerName);
        });

        this.socketClient.on('feedbackDifference', (diff: Set<number>) => {
            const data = new Set<number>(diff);
            this.diffFound.next(data);
        });

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
    }

    disconnect() {
        this.messageList = [];
        this.socketClient.disconnect();
    }

    joinRoomSolo(playerName: string) {
        this.socketClient.send('joinRoomSolo', playerName);
    }

    sendRoomName(roomName: string) {
        this.socketClient.send('sendRoomName', roomName);
    }

    startMultiGame(player: { gameId: string; creatorName: string; gameName: string; opponentName: string }): void {
        this.socketClient.send('startMultiGame', player);
    }

    gameEnded(roomName: string): void {
        this.socketClient.send('gameEnded', roomName);
    }

    stopTimer(roomName: string, playerName: string) {
        this.socketClient.send('stopTimer', [roomName, playerName]);
    }

    leaveRoom() {
        this.disconnect();
        this.socketClient.send('leaveRoom');
    }

    findDifference(information: { playerName: string; roomName: string }) {
        this.socketClient.send('findDifference', information);
    }

    sendMessage(data: { message: string; playerName: string; color: string; pos: string; gameId: string; event: boolean }) {
        this.socketClient.send('message', [data.message, data.playerName, data.color, data.pos, data.gameId, data.event]);
    }

    sendGiveUp(information: { playerName: string; roomName: string }) {
        this.socketClient.send('sendGiveUp', information);
    }

    sendDifference(diff: Set<number>, roomName: string) {
        this.socketClient.send('feedbackDifference', [Array.from(diff), roomName]);
    }

    sendGameName(gameName: string) {
        this.socketClient.send('gameName', gameName);
    }

    sendMousePosition(pos: number) {
        this.socketClient.send('mousePosition', pos);
    }
}
