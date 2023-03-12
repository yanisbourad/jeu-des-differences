import { Injectable } from '@nestjs/common';
import { Player } from './entities/player.entity';
@Injectable()
export class GameCardHandlerService {
    gamesQueue: Map<string, string[]>;
    players: Map<string, Player>;

    constructor() {
        this.gamesQueue = new Map();
        this.players = new Map();
    }

    findAllGamesStatus() {
        if (this.gamesQueue.size === 0) return {};
        const gamesStatus = {};
        this.gamesQueue.forEach((value, key) => {
            gamesStatus[key] = value.length;
        });
        return gamesStatus;
    }

    // true if not empty false if it is
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

    // add second player at the stack fifo
    dispatchPlayer(player: Player): number {
        if (this.gamesQueue.has(player.gameName)) {
            this.gamesQueue.get(player.gameName).push(player.id);
            return this.gamesQueue.get(player.gameName).length;
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
