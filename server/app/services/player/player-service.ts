import { Injectable } from '@nestjs/common';
import { Room } from '../../../../client/src/app/interfaces/rooms';
import { Player } from '../../../../client/src/app/interfaces/player';

@Injectable()
export class PlayerService {
    rooms: Room[] = [];
    maxPlayers: number = 2;
    
    async addRoom(roomName:string, host: Player, startTime: Date, nHints: number): Promise<void> {
        this.rooms.push({ name: roomName, host, players: [host], maxPlayers: 0, startTime: startTime, nHints: nHints});
    }

    async getRoomIndex(roomName: string): Promise<number> {
        return this.rooms.findIndex((room) => room?.name == roomName);
    }

    async addPlayer(roomName: string, player: Player, startTime: Date, nHints: number): Promise<void> {
        const rIndex = await this.getRoomIndex(roomName);
        if (
            this.rooms[rIndex].players.length < this.maxPlayers &&
            this.rooms[rIndex].players.findIndex((p) => p?.socketId === player.socketId) == -1
            && this.rooms[rIndex].players.findIndex((p) => p?.playerName === player.playerName) == -1) {
            this.rooms[rIndex].players.push(player);
            this.rooms[rIndex].maxPlayers++;
        } else {
            console.log(this.rooms[rIndex].players.length)
            await this.addRoom(roomName, player, startTime,nHints);
            console.log('Room is full or player already in room');
        }
    }

    async deleteRoom(roomName:string):Promise<void>{
        const rIndex = await this.getRoomIndex(roomName);
        this.rooms.splice(rIndex, 1);
        console.log(this.rooms)
    }
    async removeRoom(roomName: string): Promise<void> {
        const rIndex = await this.getRoomIndex(roomName);
        this.rooms.splice(rIndex, 1);
    }

    async removePlayer(roomName: string, socketId: string): Promise<void> {
        const rIndex = await this.getRoomIndex(roomName);
        const pIndex = this.rooms[rIndex].players.findIndex((p) => p?.socketId === socketId);
        this.rooms[rIndex].players.splice(pIndex, 1);
        this.rooms[rIndex].maxPlayers--;
        if (this.rooms[rIndex].maxPlayers == 0) {
            await this.removeRoom(roomName);
        }
    }

    async getRooms(): Promise<Room[]> {
        return this.rooms;
    }

    async getRoom(roomName: string): Promise<Room> {
        const rIndex = await this.getRoomIndex(roomName);
        return this.rooms[rIndex];
    }
}
