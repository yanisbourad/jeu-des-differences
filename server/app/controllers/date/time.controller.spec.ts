import { TimeController } from '@app/controllers/date/time.controller';
import { TimeService } from '@app/services/time/time.service';
import { Message } from '@common/message';
import { Test, TestingModule } from '@nestjs/testing';
import { createStubInstance, SinonStubbedInstance } from 'sinon';

describe('DateController', () => {
    let controller: TimeController;
    let timeService: SinonStubbedInstance<TimeService>;

    beforeEach(async () => {
        timeService = createStubInstance(TimeService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TimeController],
            providers: [
                {
                    provide: TimeService,
                    useValue: TimeService,
                },
            ],
        }).compile();

        controller = module.get<TimeController>(TimeController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('allCourses() should return all courses', async () => {
        const fakeDateInfo: Message = {
            title: 'Time',
            body: new Date().toString(),
        };
        timeService.currentTime.returns(fakeDateInfo.body);

        const dateInfo = controller.dateInfo();
        expect(timeService.currentTime.calledOnce).toBe(true);
        expect(dateInfo).toEqual(fakeDateInfo);
    });
});
