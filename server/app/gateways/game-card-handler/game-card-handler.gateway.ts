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
    responseOnJoin: { event: string, object: string };
    responseOnLeave: { event: string, object: string };

    constructor(private readonly logger: Logger, private readonly gameCardHandlerService: GameCardHandlerService) {
        this.responseOnJoin = {
            event: 'feedbackOnJoin',
            object: "Attente d'un adversaire"
        }
        this.responseOnLeave = {
            event: 'feedBackOnLeave',
            object: "empty"
        }
    }

    @SubscribeMessage('findAllGamesStatus')
    updateGameStatus(@MessageBody() payload, @ConnectedSocket() gamer: Socket) {
        this.logger.log('New request for updating games status ');
        gamer.join(gamer.id);
        const gamesStatus = this.gameCardHandlerService.findAllGamesStatus(payload);
        this.server.to(gamer.id).emit('updateStatus', Array.from(gamesStatus));
    }

    joinLimitedTimeMode(player: Player) {
        const players = this.gameCardHandlerService.manageJoinLimitMode(player)
        if (players.length === 1) {
            this.server.to(players[0].id).emit('globalEvent', this.responseOnJoin);
        } else if (players.length === 2) {
            const gameInfo = {
                gameId: this.countGame++,
                gameName: "limitedTime99999",
                creatorName: players[CREATOR_INDEX].name,
                opponentName: players[OPPONENT_INDEX].name,
                mode: "tempsLimite"
            };
            const response = {
                event: 'feedbackOnStart',
                object: gameInfo,
            }
            this.server.to(players[0].id).emit('globalEvent', response);
            this.server.to(players[1].id).emit('globalEvent', response);
        } else {
            while (players.length % 2 === 0) {
                const gameInfo = {
                    gameId: this.countGame++,
                    gameName: "limitedTime99999",
                    creatorName: players[CREATOR_INDEX].name,
                    opponentName: players[OPPONENT_INDEX].name,
                    mode: "tempsLimite"
                };
                const response = {
                    event: 'feedbackOnStart',
                    object: gameInfo,
                }
                this.server.to(players.shift().id).emit('globalEvent', response);
                this.server.to(players.shift().id).emit('globalEvent', response);
            }
            if (players.length === 1) {
                this.server.to(players[0].id).emit('globalEvent', this.responseOnJoin);
            }
        }
    }

    joinClassicMode(player: Player) {
        const stackedPlayerNumber = this.gameCardHandlerService.stackPlayer(player);

        switch (stackedPlayerNumber) {
            // when this is the creator
            case ONLY_CREATOR: {
                this.server.to(player.id).emit('globalEvent', this.responseOnJoin);
                break;
            }
            // when this is the opponent
            case CREATOR_WITH_OPPONENT: {
                this.logger.log(`New request from ${player.name}`);
                const players = this.gameCardHandlerService.getStackedPlayers(player.gameName);
                const creator = this.gameCardHandlerService.getPlayer(players[0]);
                const opponent = this.gameCardHandlerService.getPlayer(players[1]);
                const creatorResponse = {
                    event: 'feedbackOnAccept',
                    object: opponent.name,
                }
                const opponentResponse = {
                    event: 'feedbackOnWait',
                    object: creator.name,
                }
                this.server.to(players[0]).emit('globalEvent', creatorResponse);
                this.server.to(players[1]).emit('globalEvent', opponentResponse);
                break;
            }
            // when this is an opponent but there is 1 or more opponent in the stack
            default: {
                // call a function to remove player from queue and send feedback to player
                // make new pairs of players
                const response = {
                    event: 'feedbackOnWaitLonger',
                    object: "Attente d'un adversaire",
                }
                this.server.to(player.id).emit('globalEvent', response);
                break;
            }
        }
    }

    @SubscribeMessage('joinGame')
    join(@MessageBody() payload, @ConnectedSocket() gamer: Socket) {
        const player = {
            id: gamer.id,
            name: payload.name,
            gameName: payload.gameName,
            gameType: payload.gameType,
        };
        this.logger.log(`New request from ${player.id} to play ${player.gameName} in ${player.gameType} mode`);
        // send feedback to this.player
        // create queue for each game and add gamer to queue
        if (!this.gameCardHandlerService.isGameAvailable(player.gameName) && player.gameType === 'Double') {
            const response = {
                event: 'gameUnavailable',
                object: 'game deleted by admin',
            }
            this.server.to(gamer.id).emit('globalEvent', response);
            return;
        }

        gamer.join(player.id);

        // handle limited time mode
        if (player.gameType === 'limit') {
            this.joinLimitedTimeMode(player);
            return;
        }

        // handle classic mode
        this.joinClassicMode(player);
        this.server.emit('updateStatus', Array.from(this.gameCardHandlerService.updateGameStatus()));
    }

    @SubscribeMessage('cancelGame')
    cancel(@MessageBody() gameName, @ConnectedSocket() client: Socket) {
        this.logger.log(`New request from ${client.id} to cancel`);
        const player = this.gameCardHandlerService.getPlayer(client.id);
        if (player.gameType === 'limit') {
            const deletedPlayer = this.gameCardHandlerService.handleLimitedTimeCancel(client.id);
            this.logger.log(`The limited time creator ${deletedPlayer.id} left the game queue`);
            this.server.to(client.id).emit('globalEvent', this.responseOnLeave);
            return;
        }
        const totalRequest = this.gameCardHandlerService.getTotalRequest(gameName);
        // if there is only one player in the queue
        if (totalRequest === ONLY_CREATOR) {
            const creator = this.gameCardHandlerService.deletePlayer(client.id);
            this.gameCardHandlerService.deleteCreator(gameName);
            this.server.to(client.id).emit('globalEvent', this.responseOnLeave);
            this.logger.log(`The ${gameName} creator ${creator.id} left, room is empty`);
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
                this.server.to(opponent.id).emit('globalEvent', this.responseOnLeave);
                this.server.to(client.id).emit('globalEvent', this.responseOnLeave);
                this.logger.log(`${player.id} left the queue`);
                this.logger.log(`${opponent.id} left the queue`);
                const joiningPlayers = this.gameCardHandlerService.removePlayers(gameName);
                joiningPlayers.forEach((gamer) => {
                    this.server.to(gamer).emit('globalEvent', this.responseOnLeave);
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
                        const creatorResponse = {
                            event: 'feedbackOnAccept',
                            object: newOpponent.name,
                        }
                        const opponentResponse = {
                            event: 'feedbackOnWait',
                            object: creator.name,
                        }
                        this.server.to(client.id).emit('globalEvent', this.responseOnLeave);
                        this.server.to(newOpponent.id).emit('globalEvent', opponentResponse);
                        this.server.to(creator.id).emit('globalEvent', creatorResponse);
                    } else {
                        const creatorResponse = {
                            event: 'feedbackOnJoin',
                            object: "Attente d'un adversaire",
                        }
                        this.server.to(client.id).emit('globalEvent', this.responseOnLeave);
                        this.server.to(creator.id).emit('globalEvent', creatorResponse);
                    }
                    this.logger.log(`The ${gameName} game opponent left`);
                }
                this.server.to(client.id).emit('globalEvent', this.responseOnLeave);
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
            const opponentResponse = {
                event: 'feedbackOnReject',
                object: gamerCreatorName,
            }
            this.server.to(opponent.id).emit('globalEvent', opponentResponse);
            this.logger.log(`The game creator ${gamerCreator.id} rejected ${opponent.id}`);
        }
        const nextOpponent = this.gameCardHandlerService.handleReject(gamerCreator.id);
        if (nextOpponent) {
            const creatorResponse = {
                event: 'feedbackOnAccept',
                object: nextOpponent.name,
            }
            const opponentResponse = {
                event: 'feedbackOnWait',
                object: gamerCreatorName,
            }
            this.server.to(nextOpponent.id).emit('globalEvent', opponentResponse);
            this.server.to(gamerCreator.id).emit('globalEvent', creatorResponse);
        } else {
            // if no more waiting Opponent in joining queue
            this.server.to(gamerCreator.id).emit('globalEvent', this.responseOnJoin);
            this.logger.log(`The game creator ${gamerCreator.id} is waiting alone`);
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
            mode: "classic",
        };
        const response = {
            event: 'feedbackOnStart',
            object: gameInfo,
        }
        this.server.to(playersList[CREATOR_INDEX].id).emit('globalEvent', response);
        this.server.to(playersList[OPPONENT_INDEX].id).emit('globalEvent', response);
        // call a function to remove players from joining queue and send feedback to them
        const removedPlayers: string[] = this.gameCardHandlerService.removePlayers(playersList[CREATOR_INDEX].gameName);
        removedPlayers.forEach((playerId) => {
            const response = {
                event: 'feedBackOnLeave',
                object: 'refuser par createur',
            }
            this.server.to(playerId).emit('globalEvent', response);
        });
        this.logger.log(`Players were matched, ${removedPlayers.length} players left ${gameInfo.gameName} queue`);
        this.server.emit('updateStatus', Array.from(this.gameCardHandlerService.updateGameStatus()));
    }

    @SubscribeMessage('handleDelete')
    delete(@MessageBody() gameName: string) {
        const totalRequest = this.gameCardHandlerService.getTotalRequest(gameName);
        if (totalRequest === 0) this.gameCardHandlerService.deleteGame(gameName);
        else {
            const players = this.gameCardHandlerService.deleteAllWaitingPlayerByGame(gameName);
            players.forEach((gamer) => {
                const response = {
                    event: 'gameUnavailable',
                    object: 'game deleted by admin',
                }
                this.server.to(gamer).emit('globalEvent', response);
            });
        }
        this.logger.log(`The game ${gameName} was deleted by admin`);
    }

    // on disconnect
    // remove player from queue
    // send message to opponent
    handleDisconnect(client: Socket) {
        const player = this.gameCardHandlerService.getPlayer(client.id);
        if (!player) return;
        if (player.gameType === 'limit') {
            this.gameCardHandlerService.deletePlayer(client.id)
            return;
        }
        this.cancel(player.gameName, client);
    }
}
