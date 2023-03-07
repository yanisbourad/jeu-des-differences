import { Test, TestingModule } from '@nestjs/testing';
import { GameCardHandlerService } from './game-card-handler.service';

describe('GameCardHandlerService', () => {
    let service: GameCardHandlerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameCardHandlerService],
        }).compile();

        service = module.get<GameCardHandlerService>(GameCardHandlerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
