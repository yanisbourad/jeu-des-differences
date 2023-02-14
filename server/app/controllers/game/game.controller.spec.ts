import { GameService } from '@app/services/game/game.service';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameController } from './game.controller';
describe('ChatGateway', () => {
    let gateway: GameController;
    let service: SinonStubbedInstance<GameService>;
    // let server: SinonStubbedInstance<Server>;
    beforeEach(async () => {
        service = createStubInstance(GameService);
        // server = createStubInstance(Server);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [{ provide: GameService, useValue: service }, Logger],
        }).compile();
        gateway = module.get<GameController>(GameController);

        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        // gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
