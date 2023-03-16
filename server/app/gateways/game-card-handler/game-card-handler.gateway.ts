import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Player } from './entities/player.entity';
import { GameCardHandlerService } from './game-card-handler.service';

@WebSocketGateway({ namespace: '/api', cors: true, transport: ['websocket'] })
// export class GameCardHandlerGateway implements OnGatewayDisconnect {
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
        this.logger.log(`${player.name} has the id of ${player.id}`);
        // send feedback to player
        // create queue for each game and add gamer to queue
        gamer.join(player.id);
        const stackedPlayerNumber = this.gameCardHandlerService.stackPlayer(player);
        this.logger.log(`${stackedPlayerNumber} are stacked in either queue or join`);
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
                this.server.to(player.id).emit('feedbackOnWaitLonger', "Attente d'un adversaire");
                break;
            }
            // No default
        }
        this.server.emit('updateStatus', Array.from(this.gameCardHandlerService.updateGameStatus()));
    }

    @SubscribeMessage('cancelGame')
    cancel(@MessageBody() gameName, @ConnectedSocket() client: Socket) {
        // Case 1 : Player alone in the gameQueue and is the game creator
        // remove player
        const stackedPlayers = this.gameCardHandlerService.getStackedPlayers(gameName);
        if (stackedPlayers.length === 1) {
            const creator = this.gameCardHandlerService.deletePlayer(client.id);
            if (creator) {
                this.server.to(client.id).emit('feedBackOnLeave');
                this.logger.log(`${creator.name} left the queue`);
                this.server.to(client.id).emit('updateStatus', Array.from(this.gameCardHandlerService.updateGameStatus()));
            }
        }

        // Case 2 : Player is the opponent in the gameQueue
        // remove the opponent and if the joiningQueue is not empty
        // make the next player the opponent

        // Case 3 : Player is in the joiningQueue
        // remove player from joining queue

        const player = this.gameCardHandlerService.deletePlayer(client.id);
        if (player) {
            const isRemoved = this.gameCardHandlerService.removePlayerInJoiningQueue(client.id, gameName);
            if (isRemoved) {
                this.server.to(client.id).emit('feedBackOnLeave');
                this.logger.log(`${player.name} left the queue`);
            }
        }

        // remove player from gameQueue and his opponent
        // if player was waiting, delete him and next player in the queue become the creator
        // then delete the creator and send message to the next player in the queue
        // const isPlaying = this.gameCardHandlerService.isAboutToPlay(client.id, gameName);
        // this.logger.log(`isPlaying: ${isPlaying}`);
        // if (isPlaying) {
        //     // remove last player in the queue
        //     const playerId = this.gameCardHandlerService.deleteCreator(player.gameName);
        //     // remove the player from the stack
        //     const opponent = this.gameCardHandlerService.deletePlayer(playerId);
        //     this.server.to(opponent.id).emit('feedBackOnLeave');
        //     this.server.to(client.id).emit('feedBackOnLeave');
        //     this.logger.log(`${opponent.name} left the queue`);
        //     this.logger.log(`${player.name} left the queue`);
        //     // delete all waiting playersList
        //     const players = this.gameCardHandlerService.removePlayers(player.gameName);
        //     players.forEach((gamer) => {
        //         this.server.to(gamer).emit('feedBackOnLeave');
        //     });
        //     return;
        // }
        this.server.emit('updateStatus', Array.from(this.gameCardHandlerService.updateGameStatus()));
    }

    @SubscribeMessage('rejectOpponent')
    reject(@ConnectedSocket() gamerCreator: Socket) {
        // remove this opponent then fetches the next opponent
        const gamerCreatorName = this.gameCardHandlerService.getPlayer(gamerCreator.id).name;
        const opponent = this.gameCardHandlerService.deleteOpponent(gamerCreator.id);
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
        // remove opponent and delete game queue
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
        // const newPair = this.gameCardHandlerService.getStackedPlayers(gameInfo.gameName);
        const removedPlayers: string[] = this.gameCardHandlerService.removePlayers(playersList[0].gameName);
        this.logger.log(removedPlayers);
        removedPlayers.forEach((playerId) => {
            this.server.to(playerId).emit('byeTillNext', 'refuser par createur');
        });
        this.server.emit('updateStatus', Array.from(this.gameCardHandlerService.updateGameStatus()));
    }
    // on disconnect
    // remove player from queue
    // send message to opponent
    // handleDisconnect(client: Socket) {
    //     const player = this.gameCardHandlerService.deletePlayer(client.id);
    //     if (player) this.gameCardHandlerService.removePlayerInJoiningQueue(client.id, player.gameName);
    //     // if player was waiting, delete him and next player in the queue become the creator
    //     // then delete the creator and send message to the next player in the queue
    //     const isPlaying = this.gameCardHandlerService.isAboutToPlay(client.id, player.gameName);
    //     if (isPlaying) {
    //         const playerId = this.gameCardHandlerService.deleteCreator(player.gameName);
    //         const opponent = this.gameCardHandlerService.deletePlayer(playerId);
    //         this.server.to(playerId).emit('feedBackOnLeave', player.name);
    //         this.logger.log(`${opponent.name} left the queue`);
    //     }
    //     this.logger.log(`${player.name} has disconnected`);
    //     this.server.emit('updateStatus', Array.from(this.gameCardHandlerService.updateGameStatus()));
    // }
    // }
}
