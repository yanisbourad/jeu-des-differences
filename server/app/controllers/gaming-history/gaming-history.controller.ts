import { GamingHistory } from '@app/model/database/gaming-history';
import { CreateGamingHistoryDto } from '@app/model/dto/gaming-history/create-gaming-history.dto';
import { GameRecordService } from '@app/services/game-record/game-record.service';
import { Body, Controller, Delete, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
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

    @ApiCreatedResponse({
        description: 'Create gameHistory',
        type: GamingHistory,
    })
    @ApiConflictResponse({
        description: 'Return CONFLICT http status when request fails',
    })
    @Post('/create')
    async createGamingHistory(@Body() gameRecord: CreateGamingHistoryDto, @Res() response: Response) {
        try {
            const res = await this.gamesRecordService.addGamingHistory(gameRecord);
            response.status(HttpStatus.CREATED).json(res);
        } catch (error) {
            response.status(HttpStatus.CONFLICT).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Delete gameHistory',
    })
    @ApiNoContentResponse({
        description: 'Return NO_CONTENT http status when request fails',
    })
    @Delete('/')
    async deleteGamingHistory(@Res() response: Response) {
        try {
            await this.gamesRecordService.deleteGamingHistory();
            response.status(HttpStatus.OK).json('Gaming history deleted successfully');
        } catch (error) {
            response.status(HttpStatus.NO_CONTENT).send(error.message);
        }
    }
}
