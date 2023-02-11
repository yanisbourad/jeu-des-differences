import { Test, TestingModule } from '@nestjs/testing';
import { PlayerService } from './player-service';

describe('PlayerService', () => {
    let service: PlayerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayerService],
        }).compile();

        service = module.get<PlayerService>(PlayerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // it('should add player to the room', () => {});
    /**
to test : 
     
        addRoom 
        getRoomIndex
        addPlayer
        removeRoom
        getRooms
        getRoom
     
     */
});
