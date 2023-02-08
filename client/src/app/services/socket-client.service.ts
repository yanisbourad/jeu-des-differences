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
    serverTime: RoomTime[] = [];
    serverMessage: string = '';
    hintsLeft:number = 0;
    roomName: string;

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
        return this.serverTime[this.getServerTimeIndex(roomName)]?.time;
    }

    getRoomName(): string{
        return this.roomName;
    }

    getServerTimeIndex(roomName:string): number {
        return this.serverTime.findIndex((roomTime) => roomTime.id === roomName);
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
        this.socketClient.on('hello', (message: string) => {
            this.serverMessage = message;
        });

        this.socketClient.on('time',  (values :[string, number]) => {
            if (this.getServerTimeIndex(values[0]) == -1 ){ 
                this.serverTime.push({id:values[0], time:values[1]});
            }else{
                this.serverTime[this.getServerTimeIndex(values[0])].time = values[1];       
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
            console.log("nbrHintbo", hintsLeft)
            this.hintsLeft = hintsLeft;
        });
    }

    disconnect() {
        this.socketClient.disconnect();
    }
    //setRoomName
    setRoomName(roomName: string) {
        this.roomName = roomName;
    }
    //sendTime to server
    sendTime(time: number, roomName: string) {
        this.socketClient.send('time', [time, roomName]);
    }

    // addTime
    addTime(time: number, roomName:string): void {
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
        console.log("leaveRoom", roomName)
        this.socketClient.send('leaveRoom', roomName);
        this.disconnect();
    }

    // send roomName
    sendRoomName(roomName: string) {
        this.socketClient.send('roomName', roomName);
    }
}
