import { COUNTDOWN_DELAY, DELAY_BEFORE_EMITTING_TIME, MAX_COUNTDOWN } from '@common/const-chat-gateway';
import { ServerTimeService } from './server-time.service';
import { SinonFakeTimers, SinonStubbedInstance, createStubInstance, useFakeTimers } from 'sinon';
import { GameService } from '../game/game.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TimeConfig } from '@common/game';

describe('ClientTimeService', () => {
    let service: ServerTimeService;
    let clock: SinonFakeTimers;
    let gameService: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        clock = useFakeTimers();
        gameService = createStubInstance<GameService>(GameService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ServerTimeService,
                GameService,
                {
                    provide: GameService,
                    useValue: gameService,
                },
            ],
        }).compile();
        service = module.get<ServerTimeService>(ServerTimeService);
        service.timeConstants = {timeBonus: 5, timeInit: 30, timePen: 5};
        const mockTimeConfig: TimeConfig = { timeInit: 30, timePen: 5, timeBonus: 5 };
        jest.spyOn(gameService, 'getConstants').mockReturnValue(
            Promise.resolve(mockTimeConfig)
        )
    });

    afterEach(() => {
        clock.restore();
        service.resetAllTimers();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should get the time constants from cache', async () => {
        await service.getTimeConstants();
        expect(service.timeConstants).toEqual({timeBonus: 5, timeInit: 30, timePen: 5});
    });

    it('should start the chronometer', async() => {
        await service.startChronometer('1');
        clock.tick(DELAY_BEFORE_EMITTING_TIME);
        expect(service.getElapsedTime('1')).toBe(1);
        service.stopChronometer('1');
    });

    it('should start the countDown', async() => {
        await service.startCountDown('1');
        const time = service.timeConstants.timeInit-1;
        clock.tick(DELAY_BEFORE_EMITTING_TIME);
        expect(service.getElapsedTime('1')).toBe(time);
        service.stopChronometer('1');
    });

    it('should stop the countDown', async () => {
        service.countDown = 0;
        await service.startCountDown('1');
        clock.tick(COUNTDOWN_DELAY);
        expect(service.getElapsedTime('1')).toBe(0);
        service.stopCountDown('1');
    });

    it('should increase tamponTime by timeBonus if tamponTime + timeBonus is less than MAX_COUNTDOWN', () => {
        service.tamponTime = 5;
        service.timeConstants.timeBonus = 3;
        service.incrementTime();
        expect(service.tamponTime).toEqual(8);
    });
        
    it('should set tamponTime to MAX_COUNTDOWN if tamponTime + timeBonus is greater than MAX_COUNTDOWN', () => {
        service.tamponTime = 118;
        service.incrementTime();
        expect(service.tamponTime).toEqual(MAX_COUNTDOWN);
    });
        
    it('should decrease tamponTime by timePen if tamponTime - timePen is greater than 0', () => {
        service.tamponTime = 10;
        service.timeConstants.timePen = 3;
        service.decrementTime('test-id');
        expect(service.tamponTime).toEqual(7);
    });
        
    it('should set tamponTime to 0 and call stopChronometer if tamponTime - timePen is less than or equal to 0', async () => {
        jest.spyOn(gameService, 'getConstants').mockReturnValue(
            Promise.resolve({timeBonus: 5, timeInit: 3, timePen: 5})
        )
        await service.startCountDown('test-id');
        clock.tick(DELAY_BEFORE_EMITTING_TIME);
        service.decrementTime('test-id');
        expect(service.tamponTime).toEqual(0);
    });

    it('should stop the chronometer', async () => {
        await service.startChronometer('1');
        await service.startChronometer('2');
        clock.tick(DELAY_BEFORE_EMITTING_TIME);
        expect(service.getElapsedTime('1')).toBe(1);
        const time = service.stopChronometer('1');
        expect(time).toBe(1);
        clock.tick(DELAY_BEFORE_EMITTING_TIME * 2);
        const time2 = service.stopChronometer('2');
        expect(time2).toBe(3);
    });

    it('should get the elapsed time', async () => {
        await service.startChronometer('1');
        clock.tick(DELAY_BEFORE_EMITTING_TIME);
        expect(service.getElapsedTime('1')).toBe(1);
        const time = service.getElapsedTime('1');
        expect(time).toBe(1);
        service.stopChronometer('1');
    });

    it('should reset the timer', async () => {
        await service.startChronometer('1');
        clock.tick(DELAY_BEFORE_EMITTING_TIME);
        expect(service.getElapsedTime('1')).toBe(1);
        service.resetTimer('1');
        expect(service.getElapsedTime('1')).toBe(0);
        service.stopChronometer('1');
    });

    it('should reset all timers', async () => {
        await service.startChronometer('1');
        await service.startChronometer('2');
        clock.tick(DELAY_BEFORE_EMITTING_TIME);
        expect(service.getElapsedTime('1')).toBe(1);
        expect(service.getElapsedTime('2')).toBe(1);
        service.resetAllTimers();
        expect(service.getElapsedTime('1')).toBeUndefined();
        expect(service.getElapsedTime('2')).toBeUndefined();
    });

    it('should remove the timer', async () => {
        await service.startChronometer('1');
        await service.startChronometer('2');
        clock.tick(DELAY_BEFORE_EMITTING_TIME);
        expect(service.getElapsedTime('1')).toBe(1);
        expect(service.getElapsedTime('2')).toBe(1);
        service.removeTimer('1');
        expect(service.getElapsedTime('1')).toBeUndefined();
        expect(service.getElapsedTime('2')).toBe(1);
        service.stopChronometer('2');
    });
});
