import { Body, Controller, Get, Post } from '@nestjs/common';
import { Room } from '../../../../client/src/app/interfaces/rooms';
import { PlayerService } from '@app/services/player/player-service';
import { Param } from '@nestjs/common/decorators/http/route-params.decorator';

@Controller('player')
export class PlayerController {
    constructor(private readonly playerService: PlayerService) {}

    @Get('api/rooms')
    async getRooms(): Promise<Room[]> {
        return await this.playerService.getRooms();
    }

    @Get('api/rooms/:room')
    async getRoom(@Param() params): Promise<Room> {
        const rooms = await this.playerService.getRooms();
        const roomFound = await this.playerService.getRoomIndex(params.room);
        return rooms[roomFound];
    }
}
