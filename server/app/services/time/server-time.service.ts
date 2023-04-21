import { GameService } from '@app/services/game/game.service';
import { DELAY_BEFORE_EMITTING_TIME, MAX_COUNTDOWN } from '@common/const-chat-gateway';
import { TimeConfig } from '@common/game';
import { Injectable } from '@nestjs/common';
import { Subscription, interval } from 'rxjs';
import { Service } from 'typedi';

@Injectable()
@Service()
export class ServerTimeService {
    elapsedTime: number = 0;
    countDown: number;
    tamponTime: number;
    timeConstants: TimeConfig;
    timers: { [key: string]: Subscription } = {};
    elapsedTimes: Map<string, number> = new Map<string, number>();
    count: Map<string, number> = new Map<string, number>();
    incrementCount: boolean;

    constructor(private gameService: GameService) {
        this.getTimeConstants();
    }

    async getTimeConstants(): Promise<void> {
        this.timeConstants = await this.gameService.getConstants();
    }

    async startChronometer(id: string): Promise<void> {
        await this.getTimeConstants();
        this.count.set(id, 0);
        this.timers[id] = interval(DELAY_BEFORE_EMITTING_TIME).subscribe(() => {
            this.count.set(id, this.count.get(id) + 1);
            this.elapsedTimes.set(id, this.count.get(id));
        });
    }

    async startCountDown(id: string): Promise<void> {
        await this.getTimeConstants();
        let count = 0;
        this.countDown = this.timeConstants.timeInit;
        this.tamponTime = this.countDown;
        this.timers[id] = interval(DELAY_BEFORE_EMITTING_TIME).subscribe(() => {
            count++;
            this.countDown = this.tamponTime - count;
            this.stopCountDown(id);
            this.elapsedTimes.set(id, this.countDown);
        });
    }

    stopCountDown(id: string): void {
        if (this.countDown === 0) {
            this.stopChronometer(id);
        }
    }

    incrementTime(): void {
        if (this.tamponTime + this.timeConstants.timeBonus > MAX_COUNTDOWN) {
            this.tamponTime = MAX_COUNTDOWN;
        } else {
            this.tamponTime += this.timeConstants.timeBonus;
        }
    }

    decrementTime(id: string): void {
        if (this.tamponTime - this.timeConstants.timePen <= 0) {
            this.tamponTime = 0;
            this.stopChronometer(id);
        } else {
            this.tamponTime -= this.timeConstants.timePen;
        }
    }

    stopChronometer(id: string): number {
        this.timers[id].unsubscribe();
        const time = this.elapsedTimes.get(id);
        this.count.delete(id);
        this.resetTimer(id);
        return time;
    }

    getElapsedTime(id: string): number {
        return this.elapsedTimes.get(id);
    }

    resetTimer(id: string): void {
        this.elapsedTimes.set(id, 0);
        this.elapsedTime = 0;
    }

    resetAllTimers(): void {
        // used to reset all timers when test suite is finished
        this.elapsedTimes.clear();
        this.elapsedTime = 0;
        // unsubscribe to every timers
        Object.keys(this.timers).forEach((key) => {
            this.timers[key].unsubscribe();
        });
    }

    removeTimer(id: string): void {
        this.getTimeConstants();
        this.timers[id].unsubscribe();
        this.elapsedTimes.delete(id);
        this.count.delete(id);
        this.countDown = this.timeConstants.timeInit;
    }
}
