import { Test, TestingModule } from '@nestjs/testing';
import { PlayerController } from '@app/controllers/player/playerController';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { PlayerService } from '@app/services/player/player-service';

describe.only('PlayerController', () => {
    let controller: PlayerController;
    let exampleService: SinonStubbedInstance<PlayerService>;

    beforeEach(async () => {
        exampleService = createStubInstance(PlayerService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PlayerController],
            providers: [
                {
                    provide: PlayerService,
                    useValue: PlayerService,
                },
            ],
        }).compile();

        controller = module.get<PlayerController>(PlayerController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
