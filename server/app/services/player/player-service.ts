import { Injectable } from '@nestjs/common';
import { Room } from '../../../../client/src/app/interfaces/rooms';
import { Player } from '../../../../client/src/app/interfaces/player';

@Injectable()
export class PlayerService {
    rooms: Room[] = [];
    maxPlayers: number = 2;

    async addRoom(roomName:string, host: Player): Promise<void> {
        this.rooms.push({ name: roomName, host, players: [host], maxPlayers: 0 });
    }

    async getRoomIndex(roomName: string): Promise<number> {
        return this.rooms.findIndex((room) => room?.name == roomName);
    }

    async addPlayer(roomName: string, player: Player): Promise<void> {
        const rIndex = await this.getRoomIndex(roomName);
        if (
            this.rooms[rIndex].players.length < this.maxPlayers &&
            this.rooms[rIndex].players.findIndex((p) => p?.playerName == player.playerName) == -1
        ) {
            this.rooms[rIndex].players.push(player);
            this.rooms[rIndex].maxPlayers++;
        } else {
            console.log(this.rooms[rIndex].players.length)
            await this.addRoom(roomName, player);
            console.log('Room is full or player already in room');
        }
    }

    async removeRoom(roomName: string): Promise<void> {
        const rIndex = await this.getRoomIndex(roomName);
        this.rooms.splice(rIndex, 1);
    }

    async getRooms(): Promise<Room[]> {
        return this.rooms;
    }
}
