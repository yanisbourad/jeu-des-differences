import { Player } from '@common/player';
import { Room } from '@common/rooms';
import { Injectable } from '@nestjs/common';
import { INDEX_NOT_FOUND } from './consts-player-service';

@Injectable()
export class PlayerService {
    rooms: Room[] = [];
    maxPlayers: number = 1;

    async addRoom(roomName: string, host: Player, startTime: Date): Promise<void> {
        this.rooms.push({ name: roomName, host, players: [host], maxPlayers: 0, startTime });
    }//ok

    async getRoomIndex(roomName: string): Promise<number> {
        return this.rooms.findIndex((room) => room.name === roomName);
    }//ok

    async addPlayer(roomName: string, player: Player, startTime: Date): Promise<void> {
        const rIndex = await this.getRoomIndex(roomName);
        if ( this.validatePlayer(rIndex, player)) {
            this.rooms[rIndex].players.push(player);
            this.rooms[rIndex].maxPlayers++;
        } else {
            await this.addRoom(roomName, player, startTime);
        }
    }//not ok

    validatePlayer(rIndex : number, player: Player ) : boolean {
        if (!this.rooms[rIndex]) return false;
        return this.rooms[rIndex].players.findIndex((p) => p.socketId === player.socketId) === INDEX_NOT_FOUND &&
               this.rooms[rIndex].players.findIndex((p) => p.playerName === player.playerName) === INDEX_NOT_FOUND
               && this.rooms[rIndex].players.length < this.maxPlayers;
    }

    async removeRoom(roomName: string): Promise<void> {
        const rIndex = await this.getRoomIndex(roomName);
        this.rooms.splice(rIndex, 1);
    }

    async getRooms(): Promise<Room[]> {
        return this.rooms;
    }

    async getRoom(roomName: string): Promise<Room> {
        const rIndex = await this.getRoomIndex(roomName);
        return this.rooms[rIndex];
    }
}
