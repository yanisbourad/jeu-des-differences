import { GameRecord } from '@app/model/database/game-record';
import { CreateGameRecordDto } from '@app/model/dto/game-record/create-game-record.dto';
import { GameRecordService } from '@app/services/game-record/game-record.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('GamesRecord')
@Controller('gameRecord')
export class GameRecordController {
    constructor(private readonly gamesRecordService: GameRecordService) {}

    @ApiOkResponse({
        description: 'Returns all GamingHistory',
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
        description: 'Delete gameRecords for all games',
    })
    @ApiNoContentResponse({
        description: 'Return NO_CONTENT http status when request fails',
    })
    @Delete('/')
    async deleteAllGameRecords(@Res() response: Response) {
        try {
            await this.gamesRecordService.deleteGameRecords();
            response.status(HttpStatus.OK).json('Game records were deleted successfully');
        } catch (error) {
            response.status(HttpStatus.NO_CONTENT).send(error.message);
        }
    }
    @ApiOkResponse({
        description: 'Delete gameRecords for one game',
    })
    @ApiNoContentResponse({
        description: 'Return NO_CONTENT http status when request fails',
    })
    @Delete('/:gameName')
    async deleteSpecificGameRecords(@Param('gameName') gameName: string, @Res() response: Response) {
        try {
            await this.gamesRecordService.deleteGameRecordsForOneGame(gameName);
            response.status(HttpStatus.OK).json('Game record was deleted successfully');
        } catch (error) {
            response.status(HttpStatus.NO_CONTENT).send(error.message);
        }
    }
}
