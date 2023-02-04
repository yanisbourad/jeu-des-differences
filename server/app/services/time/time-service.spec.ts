import { Test, TestingModule } from '@nestjs/testing';
import { TimeService } from './time.service';

describe('DateService', () => {
    let service: TimeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TimeService],
        }).compile();

        service = module.get<TimeService>(TimeService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // it('currentTime should return the current time', () => {
    //     const fakeDateObj = new Date();
    //     const fakeDate = fakeDateObj.toString();
    //     jest.useFakeTimers().setSystemTime(fakeDateObj);
    //     expect(service.currentTime()).toEqual(fakeDate);
    // });
});
