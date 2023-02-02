import { Injectable } from '@angular/core';
import { SocketClient } from '@app/utils/socketClient';
import { Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketClientService {
  serverMessages: string[] = [];
  roomMessages: string[] = [];

  constructor(private readonly socketClient: SocketClient) {
   }

  socket: Socket;
  serverTime:number;
  serverMessage: string = "";

  get socketId() {
    return this.socketClient.socket.id ? this.socketClient.socket.id : "";
  }

  connect() {
    if (!this.socketClient.isSocketAlive()) {
      this.socketClient.connect();
      this.configureBaseSocketFeatures();
      console.log(this.serverMessage);
    }
  }
  getServerMessage():String{
    return this.serverMessage;
  }
  getServerTime():number{
    return this.serverTime;
  }

  configureBaseSocketFeatures() {
    this.socketClient.on("connect",() => {
      console.log(`connection au serveur`)
      console.log(this.serverMessage)
    });
    // Afficher le message envoyé lors de la connexion avec le serveur
    this.socketClient.on("hello", (message: string) => {
      this.serverMessage = message;
      console.log(this.serverMessage);
    });
    this.socketClient.on("clock", (time: number) => {
      this.serverTime = time;
    });

    // // Afficher le message envoyé à chaque émission de l'événement "clock" du serveur
    // this.socketClient.on("timer", () => {
    //   console.log("timer start");
    // });

    // Gérer l'événement envoyé par le serveur : afficher le résultat de validation
    this.socketClient.on('wordValidated', (isValid: boolean) => {
      //const validationString = `Le mot est ${isValid ? "valide" : "invalide"}`;
      // this.serverValidationResult = validationString;
    });

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

 //starttimer
  startTimer() {
    this.socketClient.send('timer', ()=>{ console.log("timer start");});
  }

  //classicalMode
  classicalMode(isClassicalMode: boolean) {
    this.socketClient.send('classical', isClassicalMode);
  }
}
