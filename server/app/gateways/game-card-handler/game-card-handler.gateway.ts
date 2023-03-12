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
    async updateGameStatus(@ConnectedSocket() gamer: Socket) {
        // const gameCardInfo = this.gameCardHandlerService.findAllGamesStatus();
        // this.server.to(gamer.id).emit('findAllGamesStatus', 'merci');
    }

    @SubscribeMessage('joinGame')
    join(@MessageBody() payload, @ConnectedSocket() gamer: Socket) {
        const player = {
            id: gamer.id,
            name: payload.name,
            gameName: payload.gameName,
        };
        // send feedback to player
        // create queue for each game and add gamer to queue
        gamer.join(player.id);
        const stackedPlayerNumber = this.gameCardHandlerService.stackPlayer(player);
        if (stackedPlayerNumber === 1) {
            this.server.to(player.id).emit('feedbackOnJoin', stackedPlayerNumber);
        } else if (stackedPlayerNumber === 2) {
            const players = this.gameCardHandlerService.getStackedPlayers(player.gameName);
            this.server.to(players[0]).emit('feedbackOnAccept', stackedPlayerNumber);
            this.server.to(players[1]).emit('feedbackOnWait', stackedPlayerNumber);
        } else {
            this.server.to(player.id).emit('feedbackTryAgain', stackedPlayerNumber);
        }
    }

    @SubscribeMessage('cancelGame')
    cancel(@ConnectedSocket() gamer: Socket): boolean {
        // if player is alone remove him from queue
        const player = this.gameCardHandlerService.getPlayer(gamer.id);
        // const stackedPlayerNumber = this.gameCardHandlerService.getStackedPlayers();
        // if player is with opponent remove him from queue and send message to opponent
        return true;
    }

    @SubscribeMessage('rejectOpponent')
    reject(@ConnectedSocket() gamer: Socket) {
        // send message to everyone opponent
        const opponent = this.gameCardHandlerService.deleteOponent(gamer.id);
        if (opponent) {
            this.server.to(gamer.id).emit('feedbackOnReject', true);
            this.server.to(opponent.id).emit('feedbackOnReject', false);
        } else {
            this.server.to(gamer.id).emit('feedbackOnReject', false);
        }
    }

    @SubscribeMessage('acceptOpponent')
    accept(@ConnectedSocket() gamer: Socket) {
        // send message to everyone opponent
        // remove oponent and delete game queue
        // send signal to start game
        return this.gameCardHandlerService.acceptOpponent(gamer.id);
    }
}
