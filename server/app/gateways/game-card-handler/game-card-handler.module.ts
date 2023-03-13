import { Logger, Module } from '@nestjs/common';
import { GameCardHandlerGateway } from './game-card-handler.gateway';
import { GameCardHandlerService } from './game-card-handler.service';

@Module({
    providers: [GameCardHandlerGateway, GameCardHandlerService, Logger],
})
export class GameCardHandlerModule {}
