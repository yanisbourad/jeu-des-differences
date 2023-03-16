import { Injectable } from '@nestjs/common';
import { EMPTY, MAX_CAPACITY, OVER_CROWDED, PLAYER_PAIR } from './entities/constants';
import { Player } from './entities/player.entity';
@Injectable()
export class GameCardHandlerService {
    // string: gameName, string[]: [nameCreator, nameOponent]
    gamesQueue: Map<string, string[]>;
    players: Map<string, Player>;
    joiningPlayersQueue: Map<string, string[]>;

    constructor() {
        this.gamesQueue = new Map();
        this.players = new Map();
        this.joiningPlayersQueue = new Map();
    }

    // manage queue for each game and return the number of player waiting
    // for update the status of each game at game selection page
    findAllGamesStatus(gameNames: string[]): Map<string, number> {
        if (this.gamesQueue.size === EMPTY) {
            gameNames.forEach((gameName) => {
                this.gamesQueue.set(gameName, []);
                this.joiningPlayersQueue.set(gameName, []);
            });
            return new Map<string, number>();
        }
        const gamesStatus = new Map<string, number>();
        gameNames.forEach((value) => {
            if (!this.gamesQueue.has(value)) {
                this.joiningPlayersQueue.set(value, []);
                this.gamesQueue.set(value, []);
            }
            gamesStatus.set(value, this.gamesQueue.get(value).length);
        });
        return gamesStatus;
    }

    updateGameStatus(): Map<string, number> {
        const gamesStatus = new Map<string, number>();
        this.gamesQueue.forEach((value, key) => {
            gamesStatus.set(key, value.length);
        });
        return gamesStatus;
    }

    // methods to manage player queues

    // true if not empty false if it is empty
    isPlayerWaiting(player: Player): boolean {
        return this.gamesQueue.get(player.gameName).length !== EMPTY || this.joiningPlayersQueue.get(player.gameName).length !== EMPTY;
    }

    // add player at the stack fifo
    stackPlayer(player: Player): number {
        // add each player to the players map where information about the player is stored
        this.players.set(player.id, player);
        if (!this.isPlayerWaiting(player)) {
            this.gamesQueue.get(player.gameName).push(player.id);
            return this.gamesQueue.get(player.gameName).length;
        } else {
            return this.dispatchPlayer(player);
        }
    }

    getStackedPlayers(gameName: string): string[] {
        return this.gamesQueue.get(gameName);
    }

    // add second player at the stack fifo and return the number of players waiting
    // add other joiners to the joining players queue following the game name they wish to join
    dispatchPlayer(player: Player): number {
        if (this.gamesQueue.has(player.gameName) && this.gamesQueue.get(player.gameName).length < PLAYER_PAIR) {
            this.gamesQueue.get(player.gameName).push(player.id);
            return this.gamesQueue.get(player.gameName).length;
        } else if (this.joiningPlayersQueue.has(player.gameName)) {
            if (this.joiningPlayersQueue.get(player.gameName).length < MAX_CAPACITY) {
                this.joiningPlayersQueue.get(player.gameName).push(player.id);
                return this.gamesQueue.get(player.gameName).length + this.joiningPlayersQueue.get(player.gameName).length;
            }
            return OVER_CROWDED;
        } else {
            this.joiningPlayersQueue.set(player.gameName, []);
            this.joiningPlayersQueue.get(player.gameName).push(player.id);
            return this.gamesQueue.get(player.gameName).length + this.joiningPlayersQueue.get(player.gameName).length;
        }
    }

    acceptOpponent(playerId: string): Player[] {
        const gameName = this.players.get(playerId).gameName;
        let newCreatorId: string;
        let newOponentId: string;

        if (this.joiningPlayersQueue.get(gameName).length >= PLAYER_PAIR) {
            newCreatorId = this.joiningPlayersQueue.get(gameName).shift();
            newOponentId = this.joiningPlayersQueue.get(gameName).shift();
        }
        const opponentId = this.gamesQueue.get(gameName).pop();
        const creatorId = this.gamesQueue.get(gameName).pop();
        this.gamesQueue.get(gameName).push(newCreatorId);
        this.gamesQueue.get(gameName).push(newOponentId);
        const opponentPlayer = this.players.get(opponentId);
        const creatorPlayer = this.players.get(creatorId);
        this.players.delete(opponentId);
        this.players.delete(creatorId);
        return [creatorPlayer, opponentPlayer];
    }

    deleteOponent(playerId: string): Player {
        const opponentId = this.gamesQueue.get(this.players.get(playerId).gameName).pop();
        const opponent = this.players.get(opponentId);
        if (this.players.delete(opponent.id)) {
            return opponent;
        }
    }

    getPlayer(playerId: string): Player | null {
        if (this.players.has(playerId)) return this.players.get(playerId);
        return null;
    }

    handleReject(creatorId: string): Player | undefined {
        // get the game name
        const gameName = this.players.get(creatorId).gameName;
        if (this.joiningPlayersQueue.has(gameName) && this.gamesQueue.has(gameName)) {
            // if this game has a list of waiting players

            const nextOpponentName = this.joiningPlayersQueue.get(gameName).shift();
            if (nextOpponentName) {
                // if we got a player
                const gameQueue = this.gamesQueue.get(gameName);
                gameQueue.push(nextOpponentName);
                this.gamesQueue.set(gameName, gameQueue);
                return this.getPlayer(nextOpponentName);
            }
        }
        return undefined;
    }

    // remove(id: string): boolean {
    //     const player = this.players.get(id);
    //     this.players.delete(id);
    //     if (this.gamesQueue.has(player.gameName) && this.gamesQueue.get(player.gameName).length > EMPTY) {
    //         const size = this.gamesQueue.get(player.gameName).length;
    //         if (size === 1) {
    //             this.gamesQueue.get(player.gameName).pop();
    //         } else if (size === 2) {
    //             const oponent = this.gamesQueue.get(player.gameName).pop();
    //             this.players.delete(oponent);
    //             this.gamesQueue.get(player.gameName).pop();
    //         }
    //         return true;
    //     }
    //     return false;
    // }
}
