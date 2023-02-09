import { Injectable } from '@angular/core';
import { RoomTime } from '@app/interfaces/room-time';
import { SocketClient } from '@app/utils/socket-client';
import { Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socket: Socket;
    timeIndexValue: number;
    serverMessages: string[] = [];
    serverTime: RoomTime[] = [];
    serverMessage: string = '';
    hintsLeft: number = 0;
    roomName: string;

    constructor(private readonly socketClient: SocketClient) {
        this.timeIndexValue = -1;
    }

    get socketId() {
        return this.socketClient.socket.id ? this.socketClient.socket.id : '';
    }

    connect() {
        if (!this.socketClient.isSocketAlive()) {
            this.socketClient.connect();
            this.configureBaseSocketFeatures();
            //console.log(this.serverTime, "severtime")
        }
    }

    getRoomTime(roomName: string): number {
        return this.serverTime[this.getServerTimeIndex()]?.time;
    }

    getRoomName(): string {
        console.log(this.socketId)
        console.log(this.serverTime, 'severtime')
        return this.socketId;
    }

    getServerTimeIndex(): number {
        return this.serverTime.findIndex((roomTime) => roomTime.id === this.socketId);
    }

    getServerMessage(): string {
        return this.serverMessage;
    }

    getHintLeft(): number {
        return this.hintsLeft;
    }

    configureBaseSocketFeatures() {
        this.socketClient.on('connect', () => {
            console.log('Connexion au serveur réussie');
        });
        // Afficher le message envoyé lors de la connexion avec le serveur
        this.socketClient.on('hello', (data:string) => {
            this.serverMessage = data[0];
            console.log( this.socketId);
        });

        this.socketClient.on('time', (values: [string, number]) => {
            console.log(values, 'time');
            if (this.getServerTimeIndex() === this.timeIndexValue) {
                this.serverTime.push({ id: values[0], time: values[1] });
                console.log(this.serverTime, 'severtime')
            } else {
                this.serverTime[this.getServerTimeIndex()].time = values[1];
                console.log(this.serverTime, 'severtime')
            }
        });
        // Gérer l'événement envoyé par le serveur : afficher le message envoyé lors de la connexion avec le serveur
        this.socketClient.on('message', (message: string) => {
            this.serverMessages.push(message);
        });
        // Gérer l'événement envoyé par le serveur : afficher le message envoyé par un client connecté
        this.socketClient.on('massMessage', (broadcastMessage: string) => {
            this.serverMessages.push(broadcastMessage);
        });

        this.socketClient.on('nbrHint', (hintsLeft: number) => {
            this.hintsLeft = hintsLeft;
        });
    }

    disconnect() {
        this.socketClient.disconnect();
    }

    // // setRoomName
    // setRoomName(roomName: string) {
    //     this.roomName = roomName;
    // }
    // sendTime to server
    sendTime(time: number) {
        this.socketClient.send('time', time);
    }

    // addTime
    addTime(time: number, roomName: string): void {
        this.socketClient.send('addTime', [time, roomName]);
    }

    // send number of hints
    sendNbrHint(Hints: number) {
        this.socketClient.send('nbrHint', Hints);
    }

    // joinRoom
    joinRoom(playerName: string) {
        this.socketClient.send('joinRoom', playerName);
    }

    // leaveRoom
    leaveRoom(roomName: string) {
        console.log('leaveRoom', roomName);
        this.socketClient.send('leaveRoom', roomName);
        this.disconnect();
    }

    // send roomName
    // sendRoomName(roomName: string) {
    //     this.socketClient.send('roomName', roomName);
    // }
}
