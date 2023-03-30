import { GameRecord } from '@app/model/database/game-record';
import { CreateGameRecordDto } from '@app/model/dto/game-record/create-game-record.dto';
import { GameRecordService } from '@app/services/game-record/game-record.service';
import { Body, Controller, Delete, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('GamesRecord')
@Controller('gameRecord')
export class GameRecordController {
    constructor(private readonly gamesRecordService: GameRecordService) {}

    @ApiOkResponse({
        description: 'Returns all GameRecords',
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async allGames(@Res() response: Response) {
        try {
            const allGames = await this.gamesRecordService.getAllGameRecord();
            response.status(HttpStatus.OK).json(allGames);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Create gameRecord',
        type: GameRecord,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Post('/create')
    async createGameRecord(@Body() gameRecord: CreateGameRecordDto, @Res() response: Response) {
        try {
            const res = await this.gamesRecordService.addGameRecord(gameRecord);
            response.status(HttpStatus.OK).json(res);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Delete gameRecords',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/')
    async deleteGame(@Res() response: Response) {
        try {
            await this.gamesRecordService.deleteGameRecords();
            response.status(HttpStatus.OK).json('Game deleted successfully');
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }
}
