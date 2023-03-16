import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Player } from './entities/player.entity';
import { GameCardHandlerService } from './game-card-handler.service';

@WebSocketGateway({ namespace: '/api', cors: true, transport: ['websocket'] })
export class GameCardHandlerGateway {
    @WebSocketServer()
    server: Server;
    countGame: number = 0;

    constructor(private readonly logger: Logger, private readonly gameCardHandlerService: GameCardHandlerService) {}

    @SubscribeMessage('findAllGamesStatus')
    updateGameStatus(@MessageBody() payload, @ConnectedSocket() gamer: Socket) {
        this.logger.log('New connection to find updated games status ');
        gamer.join(gamer.id);
        const gamesStatus = this.gameCardHandlerService.findAllGamesStatus(payload);
        this.server.to(gamer.id).emit('updateStatus', Array.from(gamesStatus));
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
            // when this is the creator
            case 1: {
                this.server.to(player.id).emit('feedbackOnJoin', "Attente d'un adversaire");
                break;
            }
            // when this is the opponent
            case 2: {
                const players = this.gameCardHandlerService.getStackedPlayers(player.gameName);
                const creator = this.gameCardHandlerService.getPlayer(players[0]);
                const opponent = this.gameCardHandlerService.getPlayer(players[1]);
                this.server.to(players[0]).emit('feedbackOnAccept', opponent.name);
                this.server.to(players[1]).emit('feedbackOnWait', creator.name);
                break;
            }
            // when this is an opponent but there is 1 or more opponent in the stack
            default: {
                // call a function to remove player from queue and send feedback to player
                // make new pairs of players
                this.server.to(player.id).emit('feedbackOnWaitLonger', 'Attente de disponibilte du createur');
                break;
            }
            // No default
        }
        this.server.emit('updateStatus', Array.from(this.gameCardHandlerService.updateGameStatus()));
    }

    @SubscribeMessage('cancelGame')
    cancel(@ConnectedSocket() gamer: Socket): boolean {
        // if player is alone remove him from queue
        const player = this.gameCardHandlerService.getPlayer(gamer.id);
        // const stackedPlayerNumber = this.gameCardHandlerService.getStackedPlayers();
        // if player is with opponent remove him from queue and send message to opponent
        if (player) return true;
    }

    @SubscribeMessage('rejectOpponent')
    reject(@ConnectedSocket() gamerCreator: Socket) {
        // remove this opponent then fetches the next opponent
        const gamerCreatorName = this.gameCardHandlerService.getPlayer(gamerCreator.id).name;
        const opponent = this.gameCardHandlerService.deleteOponent(gamerCreator.id);
        if (opponent) {
            this.server.to(opponent.id).emit('feedbackOnReject', true);
        }
        const nextOpponent = this.gameCardHandlerService.handleReject(gamerCreator.id);
        if (nextOpponent) {
            this.server.to(nextOpponent.id).emit('feedbackOnWait', gamerCreatorName);
            this.server.to(gamerCreator.id).emit('feedbackOnAccept', nextOpponent.name);
        } else {
            // if no more Opponent
            this.server.to(gamerCreator.id).emit('feedbackOnJoin', "Attente d'un adversaire");
        }
    }

    @SubscribeMessage('startGame')
    accept(@ConnectedSocket() gamer: Socket) {
        // send message to everyone opponent
        // remove oponent and delete game queue
        // send signal to start game
        const playersList: Player[] = this.gameCardHandlerService.acceptOpponent(gamer.id);
        const gameInfo = {
            gameId: this.countGame++,
            gameName: playersList[0].gameName,
            creatorName: playersList[0].name,
            opponentName: playersList[1].name,
        };
        this.server.to(playersList[0].id).emit('feedbackOnStart', gameInfo);
        this.server.to(playersList[1].id).emit('feedbackOnStart', gameInfo);
        // call a function to remove player from queue and send feedback to player
        // make new pairs of players
        const newPair = this.gameCardHandlerService.getStackedPlayers(gameInfo.gameName);
        if (!newPair) {
            return;
        }
        const creator = this.gameCardHandlerService.getPlayer(newPair[0]);
        const opponent = this.gameCardHandlerService.getPlayer(newPair[1]);
        this.server.to(newPair[0]).emit('feedbackOnCreator', opponent.name);
        this.server.to(newPair[1]).emit('feedbackOnWait', creator.name);
        this.server.emit('updateStatus', Array.from(this.gameCardHandlerService.updateGameStatus()));
    }
}
