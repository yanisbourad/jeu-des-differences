import { Injectable } from '@angular/core';
import { SocketClient } from '@app/utils/socket-client';
import { Socket } from 'socket.io-client';
import { ClientTimeService } from './client-time.service';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socket: Socket;
    serverMessage: string = '';
    roomName: string;

    constructor(private readonly socketClient: SocketClient, private timer: ClientTimeService) {}

    get socketId() {
        return this.socketClient.socket.id ? this.socketClient.socket.id : '';
    }

    connect() {
        if (!this.socketClient.isSocketAlive()) {
            this.socketClient.connect();
            this.configureBaseSocketFeatures();
        }
    }

    getRoomName(): string {
        return this.socketId;
    }

    getServerMessage(): string {
        return this.serverMessage;
    }

    configureBaseSocketFeatures() {
        this.socketClient.on('connect', () => {
            this.roomName = this.getRoomName();
            this.joinRoom(this.roomName);
        });
        // Afficher le message envoyé lors de la connexion avec le serveur
        this.socketClient.on('hello', (message: string) => {
            this.serverMessage = message;
        });
        // Afficher le message envoyé lors de la déconnexion avec le serveur
        this.socketClient.on('massMessage', (message: string) => {
            this.serverMessage = message;
        });
    }

    disconnect() {
        this.timer.stopTimer();
        this.socketClient.disconnect();
    }

    // joinRoom
    joinRoom(playerName: string) {
        this.socketClient.send('joinRoom', playerName);
    }

    // leaveRoom
    leaveRoom() {
        this.socketClient.send('leaveRoom');
        this.disconnect();
    }
}
