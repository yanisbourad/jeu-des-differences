import { Player } from '@common/player';
import { Room } from '@common/rooms';
import { Injectable } from '@nestjs/common';
import { INDEX_NOT_FOUND } from './consts-player-service';
// import { INDEX_NOT_FOUND } from './consts-player-service';

@Injectable()
export class PlayerService {
    rooms: Room[] = [];
    roomNamesMulti: string[] = [];
    // maxPlayers: number = 2;
    // add logic for multiplayer room
    // add logic to add two players
    async addRoomSolo(roomName: string, host: Player, startTime: Date): Promise<void> {
        this.rooms.push({ name: roomName, host, players: [host], maxPlayers: 1, startTime });
    }

    async addRoomMulti(roomName: string, players: [Player, Player], startTime: Date): Promise<void> {
        this.rooms.push({ name: roomName, host: players[0], players: [players[0], players[1]], maxPlayers: 2, startTime });
    }

    async addRoomMul(roomName: string, player: Player, startTime: Date): Promise<void> {
        this.rooms.push({ name: roomName, host: player, players: [player], maxPlayers: 2, startTime });
        console.log('room added', this.rooms);
        this.roomNamesMulti.push(roomName);
    }

    
    async addPlayerSolo(roomName: string, player: Player, startTime: Date): Promise<void> {
        await this.addRoomSolo(roomName, player, startTime);
    }

    async addPlayerMulti(roomName: string, player: [Player, Player], startTime: Date): Promise<void> {
        await this.addRoomMulti(roomName, player, startTime);
    }
    // add player to room
    async addPlayerMul(roomName: string, player: Player, startTime: Date): Promise<void> {
        console.log('roomName', roomName);
        const rIndex = await this.getRoomIndex(roomName);
        console.log('rIndex', rIndex);
        if (this.roomNamesMulti.includes(roomName)) {
            console.log('room exists');
            console.log(this.rooms[0]);
            if (this.rooms[rIndex]?.players.length < 2) {
                this.rooms[rIndex].players.push(player);
                console.log('player added');
                console.log(this.rooms[rIndex].players);
            } else {
                console.log('room full');
            }
        } else {
            console.log('room does not exist');
            await this.addRoomMul(roomName, player, startTime);
            console.log('room created', this.rooms);
            this.roomNamesMulti.push(roomName);
        }
    }

    async getRoomIndex(roomName: string): Promise<number> {
        console.log('roomName', roomName);
        console.log('this.rooms', this.rooms);
        return this.rooms.findIndex((room) => room.name === roomName);
    }

    // async addPlayerMul(roomName: string, player: Player, startTime: Date): Promise<void> {
    //     const rIndex = await this.getRoomIndex(roomName);
    //     if (rIndex !== INDEX_NOT_FOUND) {
    //         if (
    //             this.rooms[rIndex].players.length < 2 &&
    //             this.rooms[rIndex].players.findIndex((p) => p?.socketId === player.socketId) === INDEX_NOT_FOUND &&
    //             this.rooms[rIndex].players.findIndex((p) => p?.playerName === player.playerName) === INDEX_NOT_FOUND
    //         ) {
    //             this.rooms[rIndex].players.push(player);
    //         } else {
    //             await this.addRoomMul(roomName, player, startTime);
    //         }
    //     } else {
    //         await this.addRoomMul(roomName, player, startTime);
    //     }
    //     // if (
    //     //     this.rooms[rIndex].players.length < 2 &&
    //     //     this.rooms[rIndex].players.findIndex((p) => p?.socketId === player.socketId) === INDEX_NOT_FOUND &&
    //     //     this.rooms[rIndex].players.findIndex((p) => p?.playerName === player.playerName) === INDEX_NOT_FOUND
    //     // ) {
    //     //     this.rooms[rIndex].players.push(player);
    //     // } else {
    //     //     await this.addRoomMul(roomName, player, startTime);
    //     // }
    // }

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
