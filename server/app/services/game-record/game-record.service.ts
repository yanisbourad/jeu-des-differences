import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { GameRecord, GameRecordDocument } from '@app/model/database/game-record';
import { GamingHistory, GamingHistoryDocument } from '@app/model/database/gaming-history';
import { CreateGameRecordDto } from '@app/model/dto/game-record/create-game-record.dto';
import { CreateGamingHistoryDto } from '@app/model/dto/gaming-history/create-gaming-history.dto';
import { GameService } from '@app/services/game/game.service';
@Injectable()
export class GameRecordService {
    // eslint-disable-next-line max-params
    constructor(
        @InjectModel(GameRecord.name) public gameRecordModel: Model<GameRecordDocument>,
        @InjectModel(GamingHistory.name) public gamingHistoryModel: Model<GamingHistoryDocument>,
        private readonly logger: Logger,
        private readonly gameService: GameService,
    ) {}

    async getAllGameRecord(): Promise<GameRecord[]> {
        return await this.gameRecordModel.find().exec();
    }
    async getAllGamingHistory(): Promise<GamingHistory[]> {
        return await this.gamingHistoryModel.find().exec();
    }

    async addGameRecord(record: CreateGameRecordDto): Promise<void> {
        try {
            record.gameName += this.gameService.getKey;
            await this.gameRecordModel.create(record);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(`Failed to insert Game: ${error}`);
        }
    }
    async addGamingHistory(record: CreateGamingHistoryDto): Promise<void> {
        try {
            await this.gamingHistoryModel.create(record);
        } catch (error) {
            return Promise.reject(`Failed to insert Game: ${error}`);
        }
    }

    async deleteGameRecords(): Promise<void> {
        try {
            const response = await this.gamingHistoryModel.deleteMany({});
            // this.gameService.deleteGameRecords();;
            if (response.deletedCount) this.logger.log(`All ${response.deletedCount} Game Records have been deleted successfully`);
        } catch (error) {
            return Promise.reject(`Failed to delete Game: ${error}`);
        }
    }
}
