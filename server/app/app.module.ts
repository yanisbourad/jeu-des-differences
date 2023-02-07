import { CourseController } from '@app/controllers/course/course.controller';
import { TimeController } from '@app/controllers/date/time.controller';
import { ExampleController } from '@app/controllers/example/example.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Course, courseSchema } from '@app/model/database/course';
import { CourseService } from '@app/services/course/course.service';
import { ExampleService } from '@app/services/example/example.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from './controllers/game/game.controller';
import { Game, gameSchema } from './model/database/game';
import { GameRecord, gameRecordSchema } from './model/database/game-record';
import { GameService } from './services/game/game.service';
import { PlayerService } from './services/player/player-service';
import { TimeService } from './services/time/time.service';

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
        MongooseModule.forFeature([{ name: Course.name, schema: courseSchema }]),
        MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
        MongooseModule.forFeature([{ name: GameRecord.name, schema: gameRecordSchema }]),
    ],
    controllers: [CourseController, TimeController, ExampleController],
    providers: [ChatGateway, CourseService, ExampleService, Logger, TimeService, PlayerService],
})
export class AppModule {}
