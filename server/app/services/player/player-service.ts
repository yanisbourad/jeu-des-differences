import { Player } from '@common/player';
import { Room } from '@common/rooms';
import { Injectable } from '@nestjs/common';
// import { INDEX_NOT_FOUND } from './consts-player-service';

@Injectable()
export class PlayerService {
    rooms: Room[] = [];
    // maxPlayers: number = 2;
    // add logic for multiplayer room
    // add logic to add two players
    async addRoomSolo(roomName: string, host: Player, startTime: Date): Promise<void> {
        this.rooms.push({ name: roomName, host, players: [host], maxPlayers: 1, startTime });
    }

    async addRoomMulti(roomName: string, players: [Player, Player], startTime: Date): Promise<void> {
        this.rooms.push({ name: roomName, host: players[0], players: [players[0], players[1]], maxPlayers: 2, startTime });
    }

    async getRoomIndex(roomName: string): Promise<number> {
        return this.rooms.findIndex((room) => room.name === roomName);
    }

    async addPlayerSolo(roomName: string, player: Player, startTime: Date): Promise<void> {
        await this.addRoomSolo(roomName, player, startTime);
    }

    async addPlayerMulti(roomName: string, player: [Player, Player], startTime: Date): Promise<void> {
        await this.addRoomMulti(roomName, player, startTime);
    }

    // validatePlayer(rIndex: number, player: Player): boolean {
    //     if (!this.rooms[rIndex]) return false;
    //     return (
    //         this.rooms[rIndex].players.findIndex((p) => p.socketId === player.socketId) === INDEX_NOT_FOUND &&
    //         this.rooms[rIndex].players.findIndex((p) => p.playerName === player.playerName) === INDEX_NOT_FOUND &&
    //         this.rooms[rIndex].maxPlayers === this.maxPlayers
    //     );
    // }

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
