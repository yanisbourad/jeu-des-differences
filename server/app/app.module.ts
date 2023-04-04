import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GameRecordController } from './controllers/game-record/game-record.constroller';
import { GameController } from './controllers/game/game.controller';
import { GameRecord, gameRecordSchema } from './model/database/game-record';
import { GameRecordService } from './services/game-record/game-record.service';
import { GameService } from './services/game/game.service';
import { PlayerService } from './services/player/player-service';
import { GameCardHandlerModule } from './gateways/game-card-handler/game-card-handler.module';
import { ServerTimeService } from './services/time/server-time.service';
import { TimerConstantsModel, timerConstantsShema } from '@app/model/database/timer-constants';
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
            { name: TimerConstantsModel.name, schema: timerConstantsShema },
        ]),
        GameCardHandlerModule,
    ],
    controllers: [GameRecordController, GameController],
    providers: [ChatGateway, GameService, GameRecordService, Logger, PlayerService, ServerTimeService],
})
export class AppModule {}
