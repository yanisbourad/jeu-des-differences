import { Injectable } from '@nestjs/common';
import { Player } from './entities/player.entity';
@Injectable()
export class GameCardHandlerService {
    gamesQueue: Map<string, string[]>;
    players: Map<string, Player>;
    joiningPlayersQueue: Map<string, Player[]>;

    constructor() {
        this.gamesQueue = new Map();
        this.players = new Map();
        this.joiningPlayersQueue = new Map();
    }

    // manage queue for each game and return the number of player waiting
    // for update the status of each game at game selection page
    findAllGamesStatus(gameNames: string[]): Map<string, number> {
        if (this.gamesQueue.size === 0) {
            gameNames.forEach((gameName) => {
                this.gamesQueue.set(gameName, []);
            });
            return new Map<string, number>();
        }
        const gamesStatus = new Map<string, number>();
        gameNames.forEach((value) => {
            if (!this.gamesQueue.has(value)) this.gamesQueue.set(value, []);
            gamesStatus.set(value, this.gamesQueue.get(value).length);
        });
        return gamesStatus;
    }

    getObjectStatus() {
        const gamesStatus = { gameNames: [], stack: [] };
        this.gamesQueue.forEach((value, key) => {
            gamesStatus.gameNames.push(key);
            gamesStatus.stack.push(value.length);
        });
        return gamesStatus;
    }

    // methods to manage player queues

    // true if not empty false if it is -- to refactor -- all games should be already in the map
    isPlayerWaiting(player: Player): boolean {
        if (this.gamesQueue.has(player.gameName)) {
            if (this.gamesQueue.get(player.gameName).length === 0) return false;
            return true;
        } else {
            this.gamesQueue.set(player.gameName, []);
            return false;
        }
    }

    // add player at the stack fifo
    stackPlayer(player: Player): number {
        this.players.set(player.id, player);
        if (!this.isPlayerWaiting(player)) {
            this.gamesQueue.get(player.gameName).push(player.id);
            return this.gamesQueue.get(player.gameName).length;
        } else if (this.gamesQueue.get(player.gameName).length < 2) {
            return this.dispatchPlayer(player);
        } else {
            return 0;
        }
    }

    getStackedPlayers(gameName: string): string[] {
        return this.gamesQueue.get(gameName);
    }

    // add second player at the stack fifo and return the number of players waiting
    // add other joiners to the joining players queue following the game name they wish to join
    dispatchPlayer(player: Player): number {
        if (this.gamesQueue.has(player.gameName) && this.gamesQueue.get(player.gameName).length < 2) {
            this.gamesQueue.get(player.gameName).push(player.id);
            return this.gamesQueue.get(player.gameName).length;
        } else if (!this.joiningPlayersQueue.has(player.gameName)) {
            this.joiningPlayersQueue.set(player.gameName, []);
            this.joiningPlayersQueue.get(player.gameName).push(player);
            return 0;
        } else {
            this.joiningPlayersQueue.get(player.gameName).push(player);
            return 0;
        }
    }

    acceptOpponent(playerId: string): Player[] {
        const gameName = this.players.get(playerId).gameName;
        const opponent = this.gamesQueue.get(gameName).pop();
        const creator = this.gamesQueue.get(gameName).pop();
        const opponentPlayer = this.players.get(opponent);
        const creatorPlayer = this.players.get(creator);
        this.players.delete(opponent);
        this.players.delete(playerId);
        return [creatorPlayer, opponentPlayer];
    }

    deleteOponent(playerId: string): Player {
        const opponentId = this.gamesQueue.get(this.players.get(playerId).gameName).pop();
        const opponent = this.players.get(opponentId);
        if (this.players.delete(opponent.id)) {
            return opponent;
        }
    }

    getPlayer(playerId: string): Player {
        if (this.players.has(playerId)) return this.players.get(playerId);
        return null;
    }

    // remove(id: string): boolean {
    //     const player = this.players.get(id);
    //     this.players.delete(id);
    //     if (this.gamesQueue.has(player.gameName) && this.gamesQueue.get(player.gameName).length > 0) {
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
