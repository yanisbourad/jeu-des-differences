import { TimeService } from '@app/services/time/time.service';
import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID } from './chat.gateway.constants';
import { ChatEvents } from './chat.gateway.events';
import { PlayerService } from '@app/services/player/player-service';
import { Player } from '../../../../client/src/app/interfaces/player';
@WebSocketGateway({ namespace: '/api', cors: true, transport: ['websocket'] })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server;
    timeStarted: boolean = false;
    hintUsed: boolean = false;
    // isTimeStopped: boolean = false;
    private readonly room = PRIVATE_ROOM_ID;

    constructor(private readonly logger: Logger, private readonly timeService: TimeService, private readonly playerService : PlayerService) {}

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

    @SubscribeMessage(ChatEvents.StartTimer)
    startTimer() {
        if (!this.timeStarted) {
            this.timeService.startTimer();
            this.timeStarted = true;
        }
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
        const player : Player =
        {
            playerName: playerName,
            socketId: socket.id
        }
        if (await this.playerService.getRoomIndex(roomName) == -1){
            await this.playerService.addRoom(roomName, player);
            
            if (!this.timeService.timers[roomName]) {
                let count = 0;
                this.timeService.timers[roomName] = setInterval(() => {
                  if (this.hintUsed){
                    count += this.timeService.timeAdded;
                    this.hintUsed = false;
                  }  
                  count++;
                  socket.to(roomName).emit(ChatEvents.Time,  [roomName, count]);
                }, DELAY_BEFORE_EMITTING_TIME);
              }
            // console.log(await this.playerService.getRooms())
            // console.log(`Room ${roomName} created and ${playerName} joined it`);
            socket.join(roomName);
        }
        else{
            console.log( "await this.playerService.getRooms()");
            this.playerService.addPlayer(roomName, player);
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
}
