import { Injectable } from '@angular/core';
import { SocketClient } from '@app/utils/socket-client';
import { Socket } from 'socket.io-client';
import { Room } from '@common/rooms';
// import { ClientTimeService } from './client-time.service';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socket: Socket;
    serverMessage: string = '';
    id: string = '';
    messageList: { message: string; userName: string; mine: boolean }[] = [];
    elapsedTimes: Map<string, number> = new Map<string, number>();
    rooms: Room[] = [];
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
        return this.id;
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
            this.id = socketId;
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
        this.socketClient.on('message-return', (data: { message: string; userName: string }) => {
            console.log(data.userName);
            if (data) {
                this.messageList.push({ message: data.message, userName: data.userName, mine: false });
            }
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

    // joinRoomMulti
    joinRoomMulti(playerName: string[]) {
        console.log('joinRoom', this.rooms);
        this.socketClient.send('joinRoomMulti', [playerName[0], playerName[1]]);
    }

    // return first room with one player
    getRoom() {
        console.log("getroom",this.rooms);
        return this.rooms.find((room) => room.players.length === 1);
    }

    // stop timer
    stopTimer(roomName: string) {
        this.socketClient.send('stopTimer', roomName);
    }

    // leaveRoom
    leaveRoom() {
        this.disconnect();
        this.socketClient.send('leaveRoom');
    }

    sendMessage(message: string, playerName: string) {
        this.socketClient.send('message', [message, playerName]);
    }
}
