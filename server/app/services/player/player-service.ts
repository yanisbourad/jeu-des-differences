import { PlayerEntity } from '@common/player';
import { Room } from '@common/rooms';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayerService {
    rooms: Room[] = [];

    async addRoomSolo(roomName: string, host: PlayerEntity, startTime: Date): Promise<void> {
        this.rooms.push({ name: roomName, host, players: [host], maxPlayers: 1, startTime });
    }

    async addRoomMulti(roomName: string, players: [PlayerEntity, PlayerEntity], startTime: Date): Promise<void> {
        this.rooms.push({ name: roomName, host: players[0], players: [players[0], players[1]], maxPlayers: 2, startTime });
    }

    async getRoomIndex(roomName: string): Promise<number> {
        return this.rooms.findIndex((room) => room.name === roomName);
    }

    async removeRoom(roomName: string): Promise<void> {
        const rIndex = await this.getRoomIndex(roomName);
        this.rooms.splice(rIndex, 1);
    }

    // remove player
    async removePlayer(roomName: string, playerName: string): Promise<void> {
        const rIndex = await this.getRoomIndex(roomName);   
        const pIndex = this.rooms[rIndex].players.findIndex((player) => player.playerName === playerName);
        this.rooms[rIndex].players.splice(pIndex, 1);
    }

    async getRooms(): Promise<Room[]> {
        return this.rooms;
    }

    async getRoom(roomName: string): Promise<Room> {
        const rIndex = await this.getRoomIndex(roomName);
        return this.rooms[rIndex];
    }
}
