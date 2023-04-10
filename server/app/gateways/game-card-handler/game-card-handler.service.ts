import { Injectable } from '@nestjs/common';
import { CREATOR_INDEX, EMPTY, MAX_CAPACITY, MINUS_ONE, OVER_CROWDED, PLAYER_PAIR } from './entities/constants';
import { Player } from './entities/player.entity';
@Injectable()
export class GameCardHandlerService {
    gamesQueue: Map<string, string[]>;
    timeLimitedGamesQueue: string[];
    players: Map<string, Player>;
    joiningPlayersQueue: Map<string, string[]>;

    constructor() {
        this.gamesQueue = new Map();
        this.players = new Map();
        this.joiningPlayersQueue = new Map();
        this.timeLimitedGamesQueue = [];
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
    // pull out updated number of player waiting for each game in the game queue
    updateGameStatus(): Map<string, number> {
        const gamesStatus = new Map<string, number>();
        this.gamesQueue.forEach((value, key) => {
            gamesStatus.set(key, value.length);
        });
        return gamesStatus;
    }
    // return true if the player is already in the game queue not the joining queue
    // false otherwise
    isAboutToPlay(playerId: string, gameName: string): boolean {
        if (this.gamesQueue.get(gameName)) {
            const index = this.gamesQueue.get(gameName).indexOf(playerId);
            if (index !== MINUS_ONE) {
                this.gamesQueue.get(gameName).splice(index, 1);
                return this.gamesQueue.get(gameName).length !== PLAYER_PAIR;
            }
        }
        return false;
    }
    getCreatorId(gameName: string): string {
        return this.gamesQueue.get(gameName)[CREATOR_INDEX];
    }
    // return true if the player is the creator of the game
    isCreator(id: string, gameName: string): boolean {
        return this.gamesQueue.get(gameName).indexOf(id) === CREATOR_INDEX;
    }
    // return the creator info and remove him and his most likely opponent
    // from the game queue
    deleteCreator(gameName: string): string[] {
        const players = this.gamesQueue.get(gameName);
        this.gamesQueue.set(gameName, []);
        return players;
    }
    // remove the opponent the game queue and replace him by another player
    // from the joining queue if there is one and return their id for feedback purpose
    removeOpponent(gameName: string): string[] {
        const oldOpponent = this.gamesQueue.get(gameName).pop();
        if (this.joiningPlayersQueue.get(gameName).length !== EMPTY) {
            const newOpponent = this.joiningPlayersQueue.get(gameName).shift();
            this.gamesQueue.get(gameName).push(newOpponent);
            return [oldOpponent, newOpponent];
        }
        return [oldOpponent];
    }
    // delete the player from the players map and return the player
    deletePlayer(playerId: string): Player {
        const player = this.players.get(playerId);
        if (player) {
            this.players.delete(playerId);
            return player;
        }
    }
    // manage time limited game
    manageJoinLimitMode(player: Player): Player[] {
        this.players.set(player.id, player);
        this.timeLimitedGamesQueue.push(player.id);
        if (this.timeLimitedGamesQueue.length === 1) {
            return [player];
        } else if (this.timeLimitedGamesQueue.length === 2) {
            const opponentId = this.timeLimitedGamesQueue.shift();
            const opponent = this.players.get(opponentId);
            this.players.delete(opponentId);
            this.players.delete(player.id);
            return [player, opponent];
        } else {
            const players = [];

            this.timeLimitedGamesQueue.forEach((playerId) => {
                players.push(this.players.get(playerId));
                this.players.delete(playerId);
            });
            this.timeLimitedGamesQueue = [];
            return players;

        }
    }

    removePlayerInJoiningQueue(gameName: string, playerId: string) {
        if (this.gamesQueue.get(gameName)) {
            const index = this.joiningPlayersQueue.get(gameName).indexOf(playerId);
            if (index !== MINUS_ONE) {
                const element = this.joiningPlayersQueue.get(gameName).splice(index, 1);
                return element[0] === playerId;
            }
        }
        return false;
    }

    // dele the game so it could not be access by players wanting to join
    deleteGame(gameName: string): void {
        this.gamesQueue.delete(gameName);
        this.joiningPlayersQueue.delete(gameName);
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
        if (this.isPlayerWaiting(player)) {
            return this.dispatchPlayer(player);
        } else {
            this.gamesQueue.get(player.gameName).push(player.id);
            return this.gamesQueue.get(player.gameName).length;
        }
    }

    // return only the two players who are most likely to play together at a given time
    getStackedPlayers(gameName: string): string[] {
        return this.gamesQueue.get(gameName);
    }

    deleteAllWaitingPlayerByGame(gameName: string): string[] {
        const players = this.getStackedPlayers(gameName).concat(this.joiningPlayersQueue.get(gameName));
        players.forEach((playerId) => {
            this.players.delete(playerId);
        });
        this.gamesQueue.delete(gameName);
        this.joiningPlayersQueue.delete(gameName);
        return players;
    }

    getTotalRequest(gameName: string): number {
        return this.getStackedPlayers(gameName).length + this.joiningPlayersQueue.get(gameName).length;
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

    // remove all players from the joining queue and return their id
    // to be able to delete them from the players map
    removePlayers(gameName: string): string[] {
        const waitingPlayers: string[] = this.joiningPlayersQueue.get(gameName);
        waitingPlayers.forEach((id) => {
            this.players.delete(id);
        });
        this.joiningPlayersQueue.delete(gameName);
        this.joiningPlayersQueue.set(gameName, []);
        return waitingPlayers;
    }

    // return the creator and the opponent player who are ready to play
    acceptOpponent(playerId: string): Player[] {
        const gameName = this.players.get(playerId).gameName;
        const opponentId = this.gamesQueue.get(gameName).pop();
        const creatorId = this.gamesQueue.get(gameName).pop();
        const opponentPlayer = this.players.get(opponentId);
        const creatorPlayer = this.players.get(creatorId);

        // remove the players who are ready to play from the players info stack
        this.players.delete(opponentId);
        this.players.delete(creatorId);
        return [creatorPlayer, opponentPlayer];
    }

    // remove the opponent from the players map and the gameQueue map plus return the player
    deleteOpponent(playerId: string): Player {
        const opponentId = this.gamesQueue.get(this.players.get(playerId).gameName).pop();
        const opponent = this.players.get(opponentId);
        if (this.players.delete(opponent.id)) {
            return opponent;
        }
    }

    // get the player from the players map with name and id
    getPlayer(playerId: string): Player | null {
        if (this.players.has(playerId)) return this.players.get(playerId);
        return null;
    }

    handleReject(creatorId: string): Player | null {
        // get the game name
        const gameName = this.players.get(creatorId).gameName;
        if (this.joiningPlayersQueue.get(gameName).length > EMPTY) {
            // if this game has a list of waiting players
            const nextOpponentId = this.joiningPlayersQueue.get(gameName).shift();
            if (nextOpponentId) {
                // if we got a player
                this.gamesQueue.get(gameName).push(nextOpponentId);
                return this.getPlayer(nextOpponentId);
            }
        }
        return null;
    }

    isGameAvailable(gameName: string): boolean {
        return this.gamesQueue.has(gameName);
    }
}
