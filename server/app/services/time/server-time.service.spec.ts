import { DELAY_BEFORE_EMITTING_TIME } from '@common/const-chat-gateway';
import { ServerTimeService } from './server-time.service';
import { SinonFakeTimers, useFakeTimers } from 'sinon';
import { Container } from 'typedi';

describe('ClientTimeService', () => {
    let service: ServerTimeService;
    let clock: SinonFakeTimers;

    beforeEach(() => {
        service = Container.get(ServerTimeService);
        clock = useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
        service.resetAllTimers();
    });

    it('should start the chronometer', () => {
        service.startChronometer('1');
        clock.tick(DELAY_BEFORE_EMITTING_TIME);
        expect(service.getElapsedTime('1')).toBe(1);
        service.stopChronometer('1');
    });

    it('should stop the chronometer', () => {
        service.startChronometer('1');
        service.startChronometer('2');
        clock.tick(DELAY_BEFORE_EMITTING_TIME);
        expect(service.getElapsedTime('1')).toBe(1);
        const time = service.stopChronometer('1');
        expect(time).toBe(1);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        clock.tick(2000);
        const time2 = service.stopChronometer('2');
        expect(time2).toBe(3);
    });

    it('should get the elapsed time', () => {
        service.startChronometer('1');
        clock.tick(DELAY_BEFORE_EMITTING_TIME);
        expect(service.getElapsedTime('1')).toBe(1);
        const time = service.getElapsedTime('1');
        expect(time).toBe(1);
        service.stopChronometer('1');
    });

    it('should reset the timer', () => {
        service.startChronometer('1');
        clock.tick(DELAY_BEFORE_EMITTING_TIME);
        expect(service.getElapsedTime('1')).toBe(1);
        service.resetTimer('1');
        expect(service.getElapsedTime('1')).toBe(0);
        service.stopChronometer('1');
    });

    it('should reset all timers', () => {
        service.startChronometer('1');
        service.startChronometer('2');
        clock.tick(DELAY_BEFORE_EMITTING_TIME);
        expect(service.getElapsedTime('1')).toBe(1);
        expect(service.getElapsedTime('2')).toBe(1);
        service.resetAllTimers();
        expect(service.getElapsedTime('1')).toBeUndefined();
        expect(service.getElapsedTime('2')).toBeUndefined();
    });

    it('should remove the timer', () => {
        service.startChronometer('1');
        service.startChronometer('2');
        clock.tick(DELAY_BEFORE_EMITTING_TIME);
        expect(service.getElapsedTime('1')).toBe(1);
        expect(service.getElapsedTime('2')).toBe(1);
        service.removeTimer('1');
        expect(service.getElapsedTime('1')).toBeUndefined();
        expect(service.getElapsedTime('2')).toBe(1);
        service.stopChronometer('2');
    });
});
