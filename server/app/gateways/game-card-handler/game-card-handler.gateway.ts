import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CREATOR_INDEX, CREATOR_WITH_OPPONENT, ONLY_CREATOR, OPPONENT_INDEX } from './entities/constants';
import { Player } from './entities/player.entity';
import { GameCardHandlerService } from './game-card-handler.service';

@WebSocketGateway({ namespace: '/api', cors: true, transport: ['websocket'] })
export class GameCardHandlerGateway implements OnGatewayDisconnect {
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
        this.logger.log(`New request from ${player.name} to play ${player.gameName} in 1vs1 mode`);
        // send feedback to player
        // create queue for each game and add gamer to queue
        gamer.join(player.id);
        const stackedPlayerNumber = this.gameCardHandlerService.stackPlayer(player);
        switch (stackedPlayerNumber) {
            // when this is the creator
            case ONLY_CREATOR: {
                this.server.to(player.id).emit('feedbackOnJoin', "Attente d'un adversaire");
                break;
            }
            // when this is the opponent
            case CREATOR_WITH_OPPONENT: {
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
                this.server.to(player.id).emit('feedbackOnWaitLonger', "Attente d'un adversaire");
                break;
            }
        }
        this.server.emit('updateStatus', Array.from(this.gameCardHandlerService.updateGameStatus()));
    }

    @SubscribeMessage('cancelGame')
    cancel(@MessageBody() gameName, @ConnectedSocket() client: Socket) {
        const totalRequest = this.gameCardHandlerService.getTotalRequest(gameName);
        // if there is only one player in the queue
        if (totalRequest === ONLY_CREATOR) {
            const creator = this.gameCardHandlerService.deletePlayer(client.id);
            this.gameCardHandlerService.deleteCreator(gameName);
            this.server.to(client.id).emit('feedBackOnLeave');
            this.logger.log(`The ${gameName} creator ${creator.name} left, room is empty`);
        } else {
            // if there is more than one player in the queue
            const player = this.gameCardHandlerService.deletePlayer(client.id);
            const isCreator = this.gameCardHandlerService.isCreator(client.id, gameName);
            // if the player is the creator delete the creator and the opponent
            // remove all other players in the join queue
            if (isCreator) {
                this.logger.log(`The ${gameName} game creator left, room is empty`);
                const players = this.gameCardHandlerService.deleteCreator(gameName);
                const opponent = this.gameCardHandlerService.deletePlayer(players[OPPONENT_INDEX]);
                this.server.to(opponent.id).emit('feedBackOnLeave');
                this.server.to(client.id).emit('feedBackOnLeave');
                this.logger.log(`${player.name} left the queue`);
                this.logger.log(`${opponent.name} left the queue`);
                const joiningPlayers = this.gameCardHandlerService.removePlayers(gameName);
                joiningPlayers.forEach((gamer) => {
                    this.server.to(gamer).emit('feedBackOnLeave');
                });
            } else {
                // could have been match with creator or waiting in the join queue
                // if the player is the opponent delete the opponent
                // send feedback to the creator and the new opponent
                // if there are other players in the join queue
                const isDeleted = this.gameCardHandlerService.removePlayerInJoiningQueue(gameName, client.id);
                if (!isDeleted) {
                    const opponents = this.gameCardHandlerService.removeOpponent(gameName);
                    const creator = this.gameCardHandlerService.getPlayer(this.gameCardHandlerService.getCreatorId(gameName));
                    if (opponents.length === 2) {
                        const newOpponent = this.gameCardHandlerService.getPlayer(opponents[1]);
                        this.server.to(client.id).emit('feedBackOnLeave');
                        this.server.to(newOpponent.id).emit('feedbackOnWait', creator.name);
                        this.server.to(creator.id).emit('feedbackOnAccept', newOpponent.name);
                    } else {
                        this.server.to(opponents[CREATOR_INDEX]).emit('feedBackOnLeave');
                        this.server.to(creator.id).emit('feedbackOnJoin', "Attente d'un adversaire");
                    }
                    this.logger.log(`The ${gameName} game opponent left`);
                }
                this.server.to(client.id).emit('feedBackOnLeave');
                this.logger.log(`Player ${player.name} left the ${gameName} game joining queue`);
            }
        }
        this.server.emit('updateStatus', Array.from(this.gameCardHandlerService.updateGameStatus()));
    }

    @SubscribeMessage('rejectOpponent')
    reject(@ConnectedSocket() gamerCreator: Socket) {
        // remove this opponent then fetches the next opponent
        const gamerCreatorName = this.gameCardHandlerService.getPlayer(gamerCreator.id).name;
        const opponent = this.gameCardHandlerService.deleteOpponent(gamerCreator.id);
        if (opponent) {
            this.server.to(opponent.id).emit('feedbackOnReject', gamerCreatorName);
            this.logger.log(`The game creator ${gamerCreatorName} rejected ${opponent.name}`);
        }
        const nextOpponent = this.gameCardHandlerService.handleReject(gamerCreator.id);
        if (nextOpponent) {
            this.server.to(nextOpponent.id).emit('feedbackOnWait', gamerCreatorName);
            this.server.to(gamerCreator.id).emit('feedbackOnAccept', nextOpponent.name);
        } else {
            // if no more waiting Opponent in joining queue
            this.server.to(gamerCreator.id).emit('feedbackOnJoin', "Attente d'un adversaire");
        }
    }

    @SubscribeMessage('startGame')
    accept(@ConnectedSocket() gamer: Socket) {
        // send message to everyone opponent
        // remove opponent and delete game queue
        // send signal to start game
        const playersList: Player[] = this.gameCardHandlerService.acceptOpponent(gamer.id);
        const gameInfo = {
            gameId: this.countGame++,
            gameName: playersList[CREATOR_INDEX].gameName,
            creatorName: playersList[CREATOR_INDEX].name,
            opponentName: playersList[OPPONENT_INDEX].name,
        };
        this.server.to(playersList[CREATOR_INDEX].id).emit('feedbackOnStart', gameInfo);
        this.server.to(playersList[OPPONENT_INDEX].id).emit('feedbackOnStart', gameInfo);

        // call a function to remove players from joining queue and send feedback to them
        const removedPlayers: string[] = this.gameCardHandlerService.removePlayers(playersList[CREATOR_INDEX].gameName);
        removedPlayers.forEach((playerId) => {
            this.server.to(playerId).emit('byeTillNext', 'refuser par createur');
        });
        this.logger.log(`Players were matched, ${removedPlayers.length} players left ${gameInfo.gameName} queue`);
        this.server.emit('updateStatus', Array.from(this.gameCardHandlerService.updateGameStatus()));
    }
    // on disconnect
    // remove player from queue
    // send message to opponent
    handleDisconnect(client: Socket) {
        const player = this.gameCardHandlerService.getPlayer(client.id);
        if (!player) return;
        this.cancel(player.gameName, client);
    }
}
