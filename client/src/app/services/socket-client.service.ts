import { Injectable } from '@angular/core';
import { SocketClient } from '@app/utils/socket-client';
import { Socket } from 'socket.io-client';
import { Room } from '@common/rooms';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socket: Socket;
    serverMessage: string = '';
    roomName: string = '';
    messageList: { message: string; userName: string; mine: boolean; color: string; pos: string }[] = [];
    elapsedTimes: Map<string, number> = new Map<string, number>();
    rooms: Room[] = [];
    gameState = new Subject<boolean>(); // to be private
    gameState$: Observable<boolean> = this.gameState.asObservable();
    diffFounded = new Subject<Set<number>>();
    diffFounded$: Observable<Set<number>> = this.diffFounded.asObservable();

    constructor(private readonly socketClient: SocketClient) {}

    get socketId() {
        return this.socketClient.socket.id ? this.socketClient.socket.id : '';
    }

    connect() {
        if (!this.socketClient.isSocketAlive()) {
            this.socketClient.connect();
            this.configureBaseSocketFeatures();
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
        });

        this.socketClient.on('sendRoomName', (values: [string, string]) => {
            if (values[0] === 'multi') {
                this.roomName = values[1];
            }
        });

        this.socketClient.on('getRooms', (rooms: Room[]) => {
            this.rooms = rooms;
        });

        this.socketClient.on('message-return', (data: { message: string; userName: string; color: string; pos: string }) => {
            if (data) {
                this.messageList.push({ message: data.message, userName: data.userName, mine: false, color: data.color, pos: data.pos });
            }
        });

        this.socketClient.on('gameEnded', (gameEnded: boolean) => {
            this.gameState.next(gameEnded);
        });

        this.socketClient.on('feedbackDifference', (diff: Set<number>) => {
            const data = new Set<number>(diff);
            console.log('diff', data);
            this.diffFounded.next(data);
        });
    }

    disconnect() {
        // this.timer.stopTimer();
        this.socketClient.disconnect();
    }

    joinRoomSolo(playerName: string) {
        const room = this.getRoom();
        this.socketClient.send('joinRoomSolo', [playerName, room?.name]);
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

    // return first room with one player
    getRoom() {
        return this.rooms.find((room) => room.players.length === 1);
    }

    stopTimer(roomName: string) {
        this.socketClient.send('stopTimer', roomName);
    }

    leaveRoom() {
        this.socketClient.send('leaveRoom');
        this.disconnect();
    }

    sendMessage(data: { message: string; playerName: string; color: string; pos: string; gameId: string }) {
        this.socketClient.send('message', [data.message, data.playerName, data.color, data.pos, data.gameId]);
    }

    sendDifference(diff: Set<number>, roomName: string) {
        console.log('sendDifference', diff);
        this.socketClient.send('feedbackDifference', [Array.from(diff), roomName]);
    }
}
