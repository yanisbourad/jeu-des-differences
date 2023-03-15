import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GameCardHandlerGateway } from './game-card-handler.gateway';
import { GameCardHandlerService } from './game-card-handler.service';

describe('GameCardHandlerGateway', () => {
    let gateway: GameCardHandlerGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameCardHandlerGateway, GameCardHandlerService, Logger],
        }).compile();

        gateway = module.get<GameCardHandlerGateway>(GameCardHandlerGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
