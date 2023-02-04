import { Injectable } from '@angular/core';
import { SocketClient } from '@app/utils/socket-client';
import { Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socket: Socket;
    serverMessages: string[] = [];
    roomMessages: string[] = [];
    serverTime: number;
    serverMessage: string = '';

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

    getServerMessage(): string {
        return this.serverMessage;
    }

    getServerTime(): number {
        return this.serverTime;
    }

    configureBaseSocketFeatures() {
        this.socketClient.on('connect', () => {
            console.log('Connexion au serveur réussie');
        });
        // Afficher le message envoyé lors de la connexion avec le serveur
        this.socketClient.on('hello', (message: string) => {
            this.serverMessage = message;
        });
        // this.socketClient.on("clock", (time: number) => {
        //   this.serverTime = time;
        // });
        this.socketClient.on('time', (time: number) => {
            this.serverTime = time;
        });
        // Gérer l'événement envoyé par le serveur : afficher le message envoyé lors de la connexion avec le serveur
        this.socketClient.on('message', (message: string) => {
            this.serverMessages.push(message);
        });
        // Gérer l'événement envoyé par le serveur : afficher le résultat de validation

        // Gérer l'événement envoyé par le serveur : afficher le message envoyé par un client connecté
        this.socketClient.on('massMessage', (broadcastMessage: string) => {
            this.serverMessages.push(broadcastMessage);
        });

        // Gérer l'événement envoyé par le serveur : afficher le message envoyé par un membre de la salle
        this.socketClient.on('roomMessage', (roomMessage: string) => {
            this.roomMessages.push(roomMessage);
        });
    }

    disconnect() {
        this.socketClient.disconnect();
    }

    // starttimer
    startTimer() {
        this.socketClient.send('startTimer');
    }

    // stopTimer
    stopTimer() {
        this.socketClient.send('stopTimer');
    }

    // addTime
    addTime(time: number, isClassical: boolean) {
        this.socketClient.send('addTime', `${[time, isClassical]}`);
    }

    // joinRoom
    joinRoom(playerName: string) {
        this.socketClient.send('joinRoom', playerName);
    }
}
