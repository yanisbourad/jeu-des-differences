import { TimeService } from '@app/services/time/time.service';
import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME, PRIVATE_ROOM_ID } from './chat.gateway.constants';
import { ChatEvents } from './chat.gateway.events';
@WebSocketGateway({ namespace: '/api', cors: true, transport: ['websocket'] })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() server: Server;
    timeStarted: boolean = false;
    private readonly room = PRIVATE_ROOM_ID;

    constructor(private readonly logger: Logger, private readonly timeService: TimeService) {}

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
    stopTimer() {
        this.timeService.stopTimer();
    }

    @SubscribeMessage(ChatEvents.AddTime)
    addTime(_: Socket, data: [number, boolean]) {
        this.logger.log(data);
        this.timeService.addTime(data[0], data[1]);
    }

    @SubscribeMessage(ChatEvents.BroadcastAll)
    broadcastAll(socket: Socket, message: string) {
        this.server.emit(ChatEvents.MassMessage, `${message}`);
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
        setInterval(() => {
            this.emitTime();
        }, DELAY_BEFORE_EMITTING_TIME);
    }

    private emitTime() {
        this.server.emit('time', this.timeService.getCount());
    }
}
