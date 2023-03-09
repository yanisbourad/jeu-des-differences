import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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
    async updateGameStatus() {
        const gameCardInfo = this.gameCardHandlerService.findAllGamesStatus();
        this.server.emit('findAllGamesStatus', gameCardInfo);
    }

    @SubscribeMessage('joinGame')
    join(@MessageBody() payload, @ConnectedSocket() gamer: Socket) {
        const player = {
            id: gamer.id,
            name: payload.name,
            gameName: payload.gameName,
        };
        // send message to everyone else
        // create queue for each game and add gamer to queue
        return this.gameCardHandlerService.stackPlayer(player);
    }

    @SubscribeMessage('cancelGame')
    cancel(@ConnectedSocket() gamer: Socket): boolean {
        // send message to everyone else
        // return this.gameCardHandlerService.remove(gamer.id);
        return true;
    }

    @SubscribeMessage('rejectOpponent')
    reject(@ConnectedSocket() gamer: Socket) {
        // send message to everyone opponent
        return this.gameCardHandlerService.deleteOponent(gamer.id);
    }

    @SubscribeMessage('acceptOpponent')
    accept(@ConnectedSocket() gamer: Socket) {
        // send message to everyone opponent
        // remove oponent and delete game queue
        // send signal to start game
        return this.gameCardHandlerService.acceptOpponent(gamer.id);
    }
}
