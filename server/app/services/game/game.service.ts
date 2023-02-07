import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Game, GameDocument } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';

@Injectable()
export class GameService {
    constructor(@InjectModel(Game.name) public gameModel: Model<GameDocument>, private readonly logger: Logger) {
        this.start();
    }
    async start() {
        if ((await this.gameModel.countDocuments()) === 0) {
            await this.populateDB();
        }
    }

    async populateDB(): Promise<void> {
        const game: CreateGameDto[] = [
            {
                gameName: 'Object Oriented Programming',
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                originalImageData: '[1, 2, 3, 4, 5, 6, 7, 8, 9]',
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                modifiedImageData: '[1, 2, 3, 4, 5, 6, 7, 8, 9]',
                listDifferences: [[1, 2, 3, 3]],
                difficulty: 'Facile',
            },
        ];

        this.logger.log('THIS ADDS DATA TO THE DATABASE, DO NOT USE OTHERWISE');
        await this.gameModel.insertMany(game);
    }

    async getAllGames(): Promise<Game[]> {
        return await this.gameModel.find({});
    }

    async getGame(_gameName: string): Promise<Game> {
        // NB: This can return null if the Game does not exist, you need to handle it
        return await this.gameModel.findOne({ gameName: _gameName });
    }

    async addGame(game: CreateGameDto): Promise<void> {
        if (!this.validateGame(game)) {
            return Promise.reject('Invalid Game');
        }
        try {
            await this.gameModel.create(game);
        } catch (error) {
            return Promise.reject(`Failed to insert Game: ${error}`);
        }
    }

    async deleteGame(_name: string): Promise<void> {
        try {
            const res = await this.gameModel.deleteOne({
                name: _name,
            });
            if (res.deletedCount === 0) {
                return Promise.reject('Could not find Game');
            }
        } catch (error) {
            return Promise.reject(`Failed to delete Game: ${error}`);
        }
    }

    async modifyGame(game: UpdateGameDto): Promise<void> {
        const filterQuery = { name: Game.name };
        // Can also use replaceOne if we want to replace the entire object
        try {
            const res = await this.gameModel.updateOne(filterQuery, game);
            if (res.matchedCount === 0) {
                return Promise.reject('Could not find Game');
            }
        } catch (error) {
            return Promise.reject(`Failed to update document: ${error}`);
        }
    }

    // async getGameName(_name: string): Promise<string> {
    //     const filterQuery = {  name: _name };
    //     // Only get the Name and not any of the other fields
    //     try {
    //         const res = await this.gameModel.findOne(filterQuery, {
    //             difficulty: 1,
    //         });
    //         return res.difficulty;
    //     } catch (error) {
    //         return Promise.reject(`Failed to get data: ${error}`);
    //     }
    // }

    private validateGame(game: CreateGameDto): boolean {
        // return this.validateName(Game.name) && this.validateImageSize(game.modifiedImageData) && this.validateImageSize(game.originalImageData);
        return true;
    }
    private validateName(name: string): boolean {
        return name ? true : false;
    }
    private validateImageSize(imageData: number[]): boolean {
        return imageData ? true : false;
    }
}
