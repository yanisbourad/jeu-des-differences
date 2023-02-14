import { TestBed } from '@angular/core/testing';
import { DELAY_BEFORE_EMITTING_TIME } from '@common/const-chat-gateway';

import { ClientTimeService } from './client-time.service';

describe('ClientTimeService', () => {
    let service: ClientTimeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ClientTimeService);
        spyOn(service, 'startTimer').and.callThrough();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should update count after 1 second (1000ms)', () => {
        service.count = 0;
        jasmine.clock().install();
        service.startTimer();
        jasmine.clock().tick(DELAY_BEFORE_EMITTING_TIME);
        expect(service.getCount()).toBe(1);
        jasmine.clock().uninstall();
    });

    it('should start the timer', () => {
        service.startTimer();
        expect(service.time).not.toBeUndefined();
    });

    it('should get the count', () => {
        service.count = 0;
        expect(service.getCount()).toBe(0);
    });

    it('should stop the timer', () => {
        service.stopTimer();
        expect(service.time).toBeUndefined();
    });

    it('should reset the timer', () => {
        service.resetTimer();
        expect(service.count).toBe(0);
    });
});
