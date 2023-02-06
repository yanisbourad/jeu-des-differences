import { TimeService } from '@app/services/time/time.service';
import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID } from './chat.gateway.constants';
import { ChatEvents } from './chat.gateway.events';
import { PlayerService } from '@app/services/player/player-service';
import { Player } from '../../../../client/src/app/interfaces/player';
import { DateService } from '@app/services/date/date.service';
import { Room } from '../../../../client/src/app/interfaces/rooms';
@WebSocketGateway({ namespace: '/api', cors: true, transport: ['websocket'] })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server;
    timeStarted: boolean = false;
    hintUsed: boolean = false;
    clientTime: number = 0;
    // isTimeStopped: boolean = false;
    private readonly room = PRIVATE_ROOM_ID;

    constructor(private readonly logger: Logger, private readonly timeService: TimeService, 
        private readonly playerService : PlayerService, private readonly dateService: DateService) {}

    @SubscribeMessage(ChatEvents.Message)
    message(_: Socket, message: string) {
        this.logger.log(`Message reçu : ${message}`);
    }

    @SubscribeMessage(ChatEvents.Error)
    error(socket: Socket) {
        socket.emit(ChatEvents.Error, 'Erreur');
    }

    @SubscribeMessage(ChatEvents.DifferenceFound)
    differenceFound(socket: Socket) {
        socket.emit(ChatEvents.DifferenceFound, 'Différence trouvée');
    }

    @SubscribeMessage(ChatEvents.Hint)
    hint(socket: Socket) {
        socket.emit(ChatEvents.Hint, 'Indice utilisé');
    }

    @SubscribeMessage(ChatEvents.Connect)
    connect(_: Socket, message: string) {
        this.server.emit(ChatEvents.MassMessage, `: ${message}`);
        this.logger.log('connection au socket');
    }

    @SubscribeMessage(ChatEvents.Time)
    async Time(socket:Socket, data: [time:number, roomName:string]) {
        this.clientTime = data[0];
        let room =  await this.playerService.getRoom(data[1]);
        let startTime = room.startTime;
        if(this.hintUsed){
            this.dateService.penalty++;
            this.hintUsed = false;
        }
        let count = this.dateService.getElaspedTime(startTime);
        if(this.validateServerClientTime(count)){
            console.log("time is valid");
           
        }else{
            console.log("time is not valid");
            //socket.emit(ChatEvents.Time,  [room.name, count])
            socket.emit(ChatEvents.Time,  [room.name, count])
        }
        console.log("elapsed time:" ,count, this.clientTime);
        //send correct time 
        console.log(data[1])
        //socket.emit(ChatEvents.ValidateTime, this.dateService.getSeconds());
    }

    @SubscribeMessage(ChatEvents.StopTimer)
    stopTimer(_: Socket, roomName: string) {
        console.log(roomName)
        if (this.timeService.timers[roomName]) {
           clearInterval(this.timeService.timers[roomName]);
        }
       // this.timeService.isTimeStopped = true;
    }

    @SubscribeMessage(ChatEvents.AddTime)
    addTime(_: Socket, time: number) {
        this.timeService.timeAdded = time;
        this.hintUsed = true;
    }

    @SubscribeMessage(ChatEvents.BroadcastAll)
    broadcastAll(socket: Socket, message: string) {
        this.server.emit(ChatEvents.MassMessage, `${message}`);
    }

    @SubscribeMessage(ChatEvents.JoinRoom)
    async joinRoom(socket: Socket, playerName: string) {
        const roomName = playerName + ' room';
        let startTime = new Date;
        let count = this.dateService.getElaspedTime(startTime);
        console.log(startTime, this.dateService.currentTime())
        const player : Player =
        {
            playerName: playerName,
            socketId: socket.id
        }
        socket.to(roomName).emit(ChatEvents.Time,  [roomName, count]);
        if (await this.playerService.getRoomIndex(roomName) == -1){
            await this.playerService.addRoom(roomName, player, startTime);
            
            if (!this.timeService.timers[roomName]) {

                console.log(count);
                //  this.timeService.timers[roomName] = setInterval(() => {
                if (this.hintUsed){
                    count += this.timeService.timeAdded;
                    this.hintUsed = false;
                }  
                //this.validateServerClientTime(socket,45, roomName );
                 // count++;
                //console.log(count)
                  socket.to(roomName).emit(ChatEvents.Time,  [roomName, count]);
              }
            socket.join(roomName);
        }
        else{
            //this.validateServerClientTime(socket,45, roomName );
            console.log( "await this.playerService.getRooms()");
            this.playerService.addPlayer(roomName, player, startTime);
            socket.join(roomName);
        }
    }

    @SubscribeMessage(ChatEvents.LeaveRoom)
    leaveRoom(socket: Socket, playerName: string) {
        const roomName = playerName + ' room';
        socket.leave(roomName);
        if (this.timeService.timers[roomName]) {
            clearInterval(this.timeService.timers[roomName]);
        }
    }

    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, message: string) {
        // Seulement un membre de la salle peut envoyer un message aux autres
        if (socket.rooms.has(this.room)) {
            this.server.to(this.room).emit(ChatEvents.RoomMessage, `${socket.id} : ${message}`);
        }
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id} `);
        socket.emit(ChatEvents.Hello, 'Hello from serveur');
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id} `);
    }

    afterInit() {
        this.logger.log('Initialisation du socket');
    }

    validateServerClientTime(serverTime: number): boolean {
        return serverTime == this.clientTime
    //    if (this.clientTime === serverTime){
    //         socket.to(roomName).emit(ChatEvents.Time,  [roomName, serverTime]);
    //    }
    //      else{
    //         socket.to(roomName).emit(ChatEvents.Time,  [roomName, serverTime]);
    //      }
    }
}
