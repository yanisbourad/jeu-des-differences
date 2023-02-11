import { GameRecordDocument } from '@app/model/database/game-record';
import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { GameService } from './game.service';
/**
 * There is two way to test the service :
 * - Mock the mongoose Model implementation and do what ever we want to do with it (see describe GameService) or
 * - Use mongodb memory server implementation (see describe GameServiceEndToEnd) and let everything go through as if we had a real database
 *
 * The second method is generally better because it tests the database queries too.
 * We will use it more
 */

describe('GameService', () => {
    let service: GameService;
    beforeEach(async () => {
        // notice that only the functions we call from the model are mocked
        // we can´t use sinon because mongoose Model is an interface

        service = new GameService(new Model<GameRecordDocument>(), new Logger());
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
