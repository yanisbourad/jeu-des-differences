import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GameRecordController } from './controllers/game-record/game-record.constroller';
import { GameController } from './controllers/game/game.controller';
import { GamingHistoryController } from './controllers/gaming-history/gaming-history.controller';
import { GameCardHandlerModule } from './gateways/game-card-handler/game-card-handler.module';
import { GameRecord, gameRecordSchema } from './model/database/game-record';
import { GamingHistory, gamingHistorySchema } from './model/database/gaming-history';
import { TimerConstantsModel, timerConstantsShema } from './model/database/timer-constants';
import { GameRecordService } from './services/game-record/game-record.service';
import { GameService } from './services/game/game.service';
import { ServerTimeService } from './services/time/server-time.service';
@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([
            { name: GameRecord.name, schema: gameRecordSchema },
            { name: GamingHistory.name, schema: gamingHistorySchema },
            { name: TimerConstantsModel.name, schema: timerConstantsShema },
        ]),
        GameCardHandlerModule,
    ],
    controllers: [GameRecordController, GameController, GamingHistoryController],
    providers: [ChatGateway, GameService, GameRecordService, Logger, ServerTimeService],
})
export class AppModule {}
