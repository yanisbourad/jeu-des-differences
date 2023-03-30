import { GamingHistory } from '@app/model/database/gaming-history';
import { CreateGamingHistoryDto } from '@app/model/dto/gaming-history/create-gaming-history.dto';
import { GameRecordService } from '@app/services/game-record/game-record.service';
import { Body, Controller, Delete, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('GamingHistory')
@Controller('gamingHistory')
export class GamingHistoryController {
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
            const allGames = await this.gamesRecordService.getAllGamingHistory();
            response.status(HttpStatus.OK).json(allGames);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Create gameHistory',
        type: GamingHistory,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Post('/create')
    async createGamingHistory(@Body() gameRecord: CreateGamingHistoryDto, @Res() response: Response) {
        try {
            const res = await this.gamesRecordService.addGamingHistory(gameRecord);
            response.status(HttpStatus.OK).json(res);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Delete gameHistory',
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
