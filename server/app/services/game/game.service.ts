import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Game, GameDocument } from '@app/model/database/game';
import { GameRecord, GameRecordDocument } from '@app/model/database/game-record';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';

@Injectable()
export class GameService {
    constructor(
        @InjectModel(Game.name) public gameModel: Model<GameDocument>,
        @InjectModel(GameRecord.name) public gameRecordModel: Model<GameRecordDocument>,
        private readonly logger: Logger,
    ) {}

    async getAllGames(): Promise<unknown> {
        const games = await this.gameModel.find().exec();
        const gamesWithRecords = await Promise.all(
            games.map(async (game) => {
                const recordsSolo = await this.gameRecordModel.find({ gameName: game.gameName, typeGame: 'solo' }).sort({ time: 1 }).limit(3).exec();
                const recordsMulti = await this.gameRecordModel
                    .find({ gameName: game.gameName, typeGame: 'multi' })
                    .sort({ time: 1 })
                    .limit(3)
                    .exec();
                return { ...game.toObject(), rankingSolo: recordsSolo, rankingMulti: recordsMulti };
            }),
        );
        return gamesWithRecords;
    }

    async getGame(_gameName: string): Promise<Game> {
        // NB: This can return null if the Game does not exist, you need to handle it
        return await this.gameModel.findOne({ gameName: _gameName });
    }

    async addGame(game: CreateGameDto): Promise<void> {
        try {
            await this.gameModel.create(game);
            const basRecords: GameRecord[] = [];
            for (let i = 0; i < 3; i++) {
                basRecords.push({
                    gameName: game.gameName,
                    typeGame: 'multi',
                    time: '15:20', // 10min in seconds
                    playerName: 'Sharmila',
                    dateStart: new Date().getTime().toString(),
                });
                basRecords.push({
                    gameName: game.gameName,
                    typeGame: 'solo',
                    time: '12:50', // 10min in seconds
                    playerName: 'Ania',
                    dateStart: new Date().getTime().toString(),
                });
            }
            this.gameRecordModel.insertMany(basRecords);
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
            } else {
                await this.gameRecordModel.deleteMany({ gameName: _name });
            }
        } catch (error) {
            return Promise.reject(`Failed to delete Game: ${error}`);
        }
    }

    async deleteAllGames(): Promise<void> {
        try {
            await this.gameModel.deleteMany({});
            await this.gameRecordModel.deleteMany({});
        } catch (error) {
            return Promise.reject(`Failed to delete all Games: ${error}`);
        }
    }
}
