import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateGameCardHandlerDto } from './dto/create-game-card-handler.dto';
import { GameCardHandlerService } from './game-card-handler.service';

@WebSocketGateway({
    cors: {
        origin: '*', // Allow all origins
    },
})
export class GameCardHandlerGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly gameCardHandlerService: GameCardHandlerService) {}

    @SubscribeMessage('findAllGamesStatus')
    async create(createGameCardHandlerDto: CreateGameCardHandlerDto) {
        const gameCardInfo = await this.gameCardHandlerService.create(createGameCardHandlerDto);
        this.server.emit('gameCardHandler', gameCardInfo);
    }

    @SubscribeMessage('joinGame')
    join(@MessageBody('name') name: string, @ConnectedSocket() gamer: Socket) {
        // send message to everyone else
        // create queue for each game and add gamer to queue
        return this.gameCardHandlerService.identify(name, gamer.id);
    }

    @SubscribeMessage('cancelGame')
    cancel(@ConnectedSocket() gamer: Socket): boolean {
        // send message to everyone else
        return this.gameCardHandlerService.remove(gamer.id);
    }

    @SubscribeMessage('rejectOpponent')
    reject(@ConnectedSocket() gamer: Socket) {
        // send message to everyone opponent
        return this.gameCardHandlerService.sendFeedback(gamer.id);
    }

    @SubscribeMessage('acceptOpponent')
    accept(@ConnectedSocket() gamer: Socket) {
        // send message to everyone opponent
        // remove oponent and delete game queue
        // send signal to start game
        return this.gameCardHandlerService.acceptOpponent(gamer.id);
    }
}
