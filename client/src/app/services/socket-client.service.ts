import { Injectable } from '@angular/core';
import { SocketClient } from '@app/utils/socket-client';
import { Room } from '@common/rooms';
import { Observable, Subject } from 'rxjs';
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
    messageQuit: { message: string; userName: string; quit: boolean; color: string; pos: string }[] = [];
    elapsedTimes: Map<string, number> = new Map<string, number>();
    rooms: Room[] = [];
    gameState = new Subject<boolean>(); // to be private
    gameState$: Observable<boolean> = this.gameState.asObservable();

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
        // Afficher le message envoyé lors de la connexion avec le serveur
        this.socketClient.on('hello', (socketId: string) => {
            this.roomName = socketId;
        });
        // Afficher le message envoyé lors de la connexion au socket
        this.socketClient.on('message', (message: string) => {
            this.serverMessage = message;
        });
        // Obtenir le temps envoyé par le serveur
        this.socketClient.on('serverTime', (values: Map<string, number>) => {
            this.elapsedTimes = new Map(values);
            console.log(this.elapsedTimes);
        });

        this.socketClient.on('getRooms', (rooms: Room[]) => {
            this.rooms = rooms;
            // //this.setRooms(rooms);
            // console.log(this.rooms);
        });

        this.socketClient.on('message-return', (data: { message: string; userName: string; color: string; pos: string; event: boolean }) => {
            console.log(data.userName);
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

        this.socketClient.on('gameEnded', (gameEnded: boolean) => {
            // this.gameFinished = gameEnded;
            this.gameState.next(gameEnded);
            console.log('gameEnded', this.gameState);
        });
    }

    disconnect() {
        // this.timer.stopTimer();
        this.socketClient.disconnect();
    }

    // joinRoomSolo
    joinRoomSolo(playerName: string) {
        console.log('joinRoom', this.rooms);
        const room = this.getRoom();
        console.log(room);
        this.socketClient.send('joinRoomSolo', [playerName, room?.name]);
        // this.socketClient.send('joinRoom', playerName);
    }

    // joinRoom
    joinRoom(playerName: string, roomName: string) {
        // console.log('joinRoom', this.rooms);
        this.socketClient.send('joinRoom', { playerName, roomName });
    }

    // startGame
    startMultiGame(player: { id: string; creatorName: string; gameName: string; opponentName: string }): void {
        this.socketClient.send('startMultiGame', player);
    }

    gameEnded(roomName: string): void {
        console.log('gameEnded', roomName);
        this.socketClient.send('gameEnded', roomName);
    }

    // joinRoomMulti
    joinRoomMulti(playerName: string[]) {
        console.log('joinRoom', this.rooms);
        this.socketClient.send('joinRoomMulti', [playerName[0], playerName[1]]);
    }

    // return first room with one player
    getRoom() {
        console.log('getroom', this.rooms);
        return this.rooms.find((room) => room.players.length === 1);
    }

    // stop timer
    stopTimer(roomName: string) {
        this.socketClient.send('stopTimer', roomName);
    }

    // leaveRoom
    leaveRoom() {
        this.socketClient.send('leaveRoom');
        this.disconnect();
    }

    sendMessage(message: string, playerName: string, color: string, pos: string, event: boolean) {
        this.socketClient.send('message', [message, playerName, color, pos, event]);
    }
}
