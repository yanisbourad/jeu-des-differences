import { Injectable } from '@angular/core';
import { SocketClient } from '@app/utils/socket-client';
import { Socket } from 'socket.io-client';
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

    // joinRoom
    joinRoom(playerName: string) {
        this.socketClient.send('joinRoom', playerName);
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
