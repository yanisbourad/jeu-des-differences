import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Game, GameDocument } from '@app/model/database/game';
import { GameRecord, GameRecordDocument } from '@app/model/database/game-record';
import { CreateGameRecordDto } from '@app/model/dto/game-record/create-game-record.dto';

@Injectable()
export class GameRecordService {
    constructor(
        @InjectModel(Game.name) public gameModel: Model<GameDocument>,
        @InjectModel(GameRecord.name) public gameRecordModel: Model<GameRecordDocument>,
        private readonly logger: Logger,
    ) {}

    async getAllGameRecord(): Promise<unknown> {
        return await this.gameRecordModel.find().exec();
    }

    async addGameRecord(record: CreateGameRecordDto): Promise<void> {
        try {
            await this.gameRecordModel.create(record);
        } catch (error) {
            return Promise.reject(`Failed to insert Game: ${error}`);
        }
    }
}
