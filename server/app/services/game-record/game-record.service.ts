import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GameRecord, GameRecordDocument } from '@app/model/database/game-record';
import { CreateGameRecordDto } from '@app/model/dto/game-record/create-game-record.dto';
import { GameService } from '@app/services/game/game.service';
@Injectable()
export class GameRecordService {
    constructor(
        @InjectModel(GameRecord.name) public gameRecordModel: Model<GameRecordDocument>,
        private readonly logger: Logger,
        private readonly gameService: GameService,
    ) {}

    async getAllGameRecord(): Promise<GameRecord[]> {
        return await this.gameRecordModel.find().exec();
    }

    async addGameRecord(record: CreateGameRecordDto): Promise<void> {
        try {
            record.gameName += this.gameService.getKey;
            await this.gameRecordModel.create(record);
        } catch (error) {
            return Promise.reject(`Failed to insert Game: ${error}`);
        }
    }

    async deleteGameRecords(): Promise<void> {
        try {
            const response = await this.gameRecordModel.deleteMany({});
            if (response.deletedCount) this.logger.log(`All ${response.deletedCount} Game Records have been deleted successfully`);
        } catch (error) {
            return Promise.reject(`Failed to delete Game: ${error}`);
        }
    }
}
