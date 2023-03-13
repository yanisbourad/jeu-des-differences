import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameCardHandlerService } from './game-card-handler.service';

@WebSocketGateway({ namespace: '/api', cors: true, transport: ['websocket'] })
export class GameCardHandlerGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly logger: Logger, private readonly gameCardHandlerService: GameCardHandlerService) {}

    @SubscribeMessage('findAllGamesStatus')
    updateGameStatus(@MessageBody() payload, @ConnectedSocket() gamer: Socket) {
        this.logger.log('New connection to find updated games status ');
        gamer.join(gamer.id);
        this.gameCardHandlerService.findAllGamesStatus(payload);
        const gamesStatus = this.gameCardHandlerService.getObjectStatus();
        this.server.to(gamer.id).emit('found', gamesStatus);
    }

    @SubscribeMessage('joinGame')
    join(@MessageBody() payload, @ConnectedSocket() gamer: Socket) {
        const player = {
            id: gamer.id,
            name: payload.name,
            gameName: payload.gameName,
        };
        this.logger.log(`${player.name} asks to play ${player.gameName} in 1vs1 mode`);
        // send feedback to player
        // create queue for each game and add gamer to queue
        gamer.join(player.id);
        const stackedPlayerNumber = this.gameCardHandlerService.stackPlayer(player);
        switch (stackedPlayerNumber) {
            case 1: {
                this.server.to(player.id).emit('feedbackOnJoin', "Attente d'un adversaire");

                break;
            }
            case 2: {
                const players = this.gameCardHandlerService.getStackedPlayers(player.gameName);
                const creator = this.gameCardHandlerService.getPlayer(players[0]);
                const opponent = this.gameCardHandlerService.getPlayer(players[1]);
                this.server.to(players[0]).emit('feedbackOnAccept', opponent.name);
                this.server.to(players[1]).emit('feedbackOnWait', creator.name);

                break;
            }
            case 0: {
                this.server.to(player.id).emit('feedbackOnWaitLonger', "Attente d'un adversaire");

                break;
            }
            // No default
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
