import { Injectable } from '@angular/core';
import { SocketClient } from '@app/utils/socket-client';
import { Socket } from 'socket.io-client';
import { RoomTime } from '@app/interfaces/room-time';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socket: Socket;
    serverMessages: string[] = [];
    roomMessages: string[] = [];

    serverTime: RoomTime[] = [];
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

    getRoomTime(roomName : string) : number {
        //console.log("getRoomTime", roomName, this.serverTime[this.getServerTimeIndex(roomName)]?.time)
        return this.serverTime[this.getServerTimeIndex(roomName)]?.time;
    }
    getServerTimeIndex(roomName:string): number {
        return this.serverTime.findIndex((roomTime) => roomTime.id === roomName);
    }

    getServerMessage(): string {
        return this.serverMessage;
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
        this.socketClient.on('time',  (values :[string, number]) => {
            console.log("time", values)
            if (this.getServerTimeIndex(values[0]) == -1 ){ 
                this.serverTime.push({id:values[0], time:values[1]});
            }else{
                this.serverTime[this.getServerTimeIndex(values[0])].time = values[1];       
            }
            console.log("getRoomTime", values[0], this.serverTime[this.getServerTimeIndex(values[0])]?.time)
            console.log("serverTime", this.serverTime[this.getServerTimeIndex(values[0])].time)
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

    //sendTime to server
    sendTime(time: number, roomName: string) {
        this.socketClient.send('time', [time, roomName]);
    }

    // starttimer
    startTimer() {
        this.socketClient.send('startTimer');
    }

    // stopTimer
    stopTimer(roomName:string) {
        this.socketClient.send('stopTimer', roomName);
        console.log("stopTimer")
        console.log(this.serverTime)
    }

    // addTime
    addTime(time: number): void {
        this.socketClient.send('addTime', time);
    }

    // joinRoom
    joinRoom(playerName: string) {
        this.socketClient.send('joinRoom', playerName);
    }

    // leaveRoom
    leaveRoom(playerName: string) {
        this.socketClient.send('leaveRoom', playerName);
    }

}
