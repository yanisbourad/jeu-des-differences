import { GameService } from '@app/services/game/game.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Game, TimeConfig } from './../../../../common/game';

@ApiTags('Games')
@Controller('game')
export class GameController {
    constructor(private readonly gamesService: GameService) {}

    @ApiOkResponse({
        description: 'Returns all Games',
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async allGames(@Res() response: Response) {
        try {
            const allGames = await this.gamesService.getAllGames();
            response.status(HttpStatus.OK).json(allGames);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Get game by name',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/constants')
    async getConstants(@Res() response: Response) {
        try {
            const constants = await this.gamesService.getConstants();
            response.status(HttpStatus.OK).json(constants);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Get('/:id')
    async gameId(@Param('id') id: string, @Res() response: Response) {
        try {
            const game = await this.gamesService.getGame(id);
            response.status(HttpStatus.OK).json(game);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Create game',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Post('/create')
    async createGame(@Body() game: Game, @Res() response: Response) {
        try {
            await this.gamesService.addGame(game);
            response.status(HttpStatus.OK).json('Game added successfully');
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Validate Game Name',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/validate/:name')
    async validateGameName(@Param('name') name: string, @Res() response: Response) {
        const res = this.gamesService.isValidGameName(name);
        response.status(HttpStatus.OK).json(res);
    }

    @Delete('/:id')
    async deleteGame(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.gamesService.deleteGame(id);
            response.status(HttpStatus.OK).json('Game deleted successfully');
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @Delete('/')
    async deleteAllGames(@Res() response: Response) {
        try {
            await this.gamesService.deleteAllGames();
            response.status(HttpStatus.OK).json('Game deleted successfully');
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    // function that post the new values of the three timers (variables)
    @Put('/constants')
    async updateConstants(@Body() newConstants: TimeConfig, @Res() response: Response) {
        try {
            await this.gamesService.updateConstants(newConstants);
            response.status(HttpStatus.OK).json('constants updated successfully');
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }
}
