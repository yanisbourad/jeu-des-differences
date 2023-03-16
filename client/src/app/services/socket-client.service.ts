import { Injectable } from '@angular/core';
import { SocketClient } from '@app/utils/socket-client';
import { Room } from '@common/rooms';
import { Subject } from 'rxjs';
import { GiveupmessagePopupComponent } from '@app/components/giveupmessage-popup/giveupmessage-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { Socket } from 'socket.io-client';
// import { ClientTimeService } from './client-time.service';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socket: Socket;
    serverMessage: string = '';
    roomName: string = '';
    messageList: { message: string; userName: string; mine: boolean; color: string; pos: string; event: boolean }[] = [];
    elapsedTimes: Map<string, number> = new Map<string, number>();
    rooms: Room[] = [];
    gameState = new Subject<boolean>();
    gameState$ = this.gameState.asObservable();
    playerFoundDiff = new Subject<string>();
    playerFoundDiff$ = this.playerFoundDiff.asObservable();
    infoDiff: { playerName: string };
    playerGaveUp: string;
    statusPlayer: string;

    private diffFounded = new Subject<Set<number>>();
    diffFounded$ = this.diffFounded.asObservable();
    constructor(private readonly socketClient: SocketClient, public dialog: MatDialog) {}

    get socketId() {
        return this.socketClient.socket.id ? this.socketClient.socket.id : '';
    }

    connect() {
        if (!this.socketClient.isSocketAlive()) {
            this.socketClient.connect();
            this.configureBaseSocketFeatures();
            console.log('connection au socket', this.socketClient.socket.id);
        }
    }

    getRoomTime(roomName: string): number {
        return this.elapsedTimes.get(roomName) as number;
    }

    getRoomName(): string {
        return this.roomName;
    }

    getServerMessage(): string {
        return this.serverMessage;
    }

    configureBaseSocketFeatures() {
        this.socketClient.on('connect', () => {
            // alert('connection au socket');
        });
        this.socketClient.on('hello', (socketId: string) => {
            this.roomName = socketId;
        });
        this.socketClient.on('message', (message: string) => {
            this.serverMessage = message;
        });
        this.socketClient.on('serverTime', (values: Map<string, number>) => {
            this.elapsedTimes = new Map(values);
            // console.log('elapsedTimes', this.elapsedTimes);
        });

        this.socketClient.on('sendRoomName', (values: [string, string]) => {
            if (values[0] === 'multi') {
                this.roomName = values[1];
            }
        });

        this.socketClient.on('message-return', (data: { message: string; userName: string; color: string; pos: string; event: boolean }) => {
            console.log(data);
            if (data) {
                this.messageList.push({
                    message: data.message,
                    userName: data.userName,
                    mine: false,
                    color: data.color,
                    pos: data.pos,
                    event: data.event,
                });
            }
        });

        this.socketClient.on('gameEnded', (data: [gameEnded: boolean, player: string]) => {
            this.gameState.next(data[0]);
            this.statusPlayer = data[1];
            console.log('gameEnded', data);
        });

        this.socketClient.on('findDifference-return', (data: { playerName: string }) => {
            this.playerFoundDiff.next(data.playerName);
        });

        this.socketClient.on('feedbackDifference', (diff: Set<number>) => {
            const data = new Set<number>(diff);
            // console.log('diff', data);
            this.diffFounded.next(data);
        });

        this.socketClient.on('giveup-return', (data: { playerName: string }) => {
            this.playerGaveUp = data.playerName;
            console.log('on giveup-return', data);
            this.stopTimer(this.getRoomName(), data.playerName);
            const dialog = this.dialog.open(GiveupmessagePopupComponent, {
                data: { name: this.playerGaveUp },
                disableClose: true,
                width: '544px',
                height: '255px',
            });

            dialog.afterClosed().subscribe(() => {
               // this.leaveRoom();
                this.disconnect();
            });
        });
    }

    disconnect() {
        // this.timer.stopTimer();
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
        console.log('gameEnded you called for me!!');
        this.socketClient.send('gameEnded', roomName);
    }

    // return first room with one player
    getRoom() {
        return this.rooms.find((room) => room.players.length === 1);
    }

    stopTimer(roomName: string, playerName: string) {
        console.log('stopTimer you called for me!!');
        console.log('roomName', roomName);
        this.socketClient.send('stopTimer', [roomName, playerName]);
    }

    leaveRoom() {
        this.disconnect();
        this.socketClient.send('leaveRoom');
    }

    findDifference(information: { playerName: string; roomName: string }) {
        this.socketClient.send('findDifference', information);
    }

    // sendMessage(message: string, playerName: string, color: string, pos: string, gameId: string) {
    //     this.socketClient.send('message', [message, playerName, color, pos, gameId]);
    // }
    sendMessage(data: { message: string; playerName: string; color: string; pos: string; gameId: string; event: boolean }) {
        this.socketClient.send('message', [data.message, data.playerName, data.color, data.pos, data.gameId, data.event]);
    }

    sendGiveUp(information: { playerName: string; roomName: string }) {
        this.socketClient.send('sendGiveUp', information);
        console.log('should send to server');
    }
    sendDifference(diff: Set<number>, roomName: string) {
        // console.log('sendDifference', diff);
        this.socketClient.send('feedbackDifference', [Array.from(diff), roomName]);
    }
}
