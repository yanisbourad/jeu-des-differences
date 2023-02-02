import { DateService } from '@app/services/date/date.service';
import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { channel } from 'diagnostics_channel';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID, WORD_MIN_LENGTH } from './chat.gateway.constants';
import { ChatEvents } from './chat.gateway.events';
@WebSocketGateway({namespace: '/api', cors:true, transport: ['websocket']})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {

    @WebSocketServer()  server: Server;

    private readonly room = PRIVATE_ROOM_ID;
    isClassicalMode: boolean = true;
    
    constructor(private readonly logger: Logger, private readonly dateService : DateService) {
        console.log("ChatGateway constructor");
        // this.isClassicalMode = isClassicalMode;
    
        (this.isClassicalMode)? this.dateService.startTimer() : this.dateService.startCountDown();
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id} `);
        // message initial
        socket.emit(ChatEvents.Hello, 'Hello from serveur');  
    }
    
    handleDisconnect(socket: Socket,) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id} `);
    }

    @SubscribeMessage(ChatEvents.Message)
    message(_: Socket, message: string) {
        this.logger.log(`Message reçu : ${message}`);
    }
    @SubscribeMessage(ChatEvents.isClassicalMode)
    ClassicalMode(_: Socket, isClassicalMode: boolean) {
        this.isClassicalMode = isClassicalMode;
        this.logger.log(`isClassicalMode : ${isClassicalMode}`);
    }

    @SubscribeMessage(ChatEvents.Connect)
    connect(_: Socket, message: string) {
        this.server.emit(ChatEvents.MassMessage, `: ${message}`);
        this.logger.log(`connection au socket`);
    }

    @SubscribeMessage(ChatEvents.Timer)
    timer(_: Socket) {
        this.logger.log("timer start")
        this.server.emit(ChatEvents.Timer, this.dateService.startTimer());
    }

    @SubscribeMessage(ChatEvents.CountDown)
    countDown(_: Socket) {
        this.server.emit(ChatEvents.CountDown, this.dateService.startCountDown());
    }

    @SubscribeMessage(ChatEvents.Validate)
    validate(socket: Socket, word: string) {
        socket.emit(ChatEvents.WordValidated, word.length > WORD_MIN_LENGTH);
    }

    @SubscribeMessage(ChatEvents.BroadcastAll)
    broadcastAll(socket: Socket, message: string) {
        this.server.emit(ChatEvents.MassMessage, `${socket.id} : ${message}`);
    }

    @SubscribeMessage(ChatEvents.JoinRoom)
    joinRoom(socket: Socket) {
        socket.join(this.room);
    }

    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, message: string) {
        // Seulement un membre de la salle peut envoyer un message aux autres
        if (socket.rooms.has(this.room)) {
            this.server.to(this.room).emit(ChatEvents.RoomMessage, `${socket.id} : ${message}`);
            console.log(message);
        }
    }
    
    afterInit() {
        setInterval(() => {
            this.emitTime();
        }, DELAY_BEFORE_EMITTING_TIME);
    }

    private emitTime() {
       this.server.emit('clock', this.dateService.getCount());
    } 
}
