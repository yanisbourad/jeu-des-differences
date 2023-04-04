import { Injectable } from '@nestjs/common';
import { DELAY_BEFORE_EMITTING_TIME, MAX_COUNTDOWN } from '@common/const-chat-gateway';
import { interval, Subscription } from 'rxjs';
import { Service } from 'typedi';

@Injectable()
@Service()
export class ServerTimeService {
    elapsedTime: number = 0;
    countDown: number;
    tamponTime: number;
    hintPenalty: number = 5; // to change
    timeIncrement: number = 5; // to change
    timers: { [key: string]: Subscription } = {};
    elapsedTimes: Map<string, number> = new Map<string, number>();

    startChronometer(id: string): void {
        let count = 0;
        this.timers[id] = interval(DELAY_BEFORE_EMITTING_TIME).subscribe(() => {
            count++;
            this.elapsedTimes.set(id, count);
        });
    }

    // start countDown
    startCountDown(id: string): void {
        let count = 0;
        this.tamponTime = this.countDown;
        this.timers[id] = interval(DELAY_BEFORE_EMITTING_TIME).subscribe(() => {
            count++;
            this.countDown = this.tamponTime - count;
            this.elapsedTimes.set(id, this.countDown);
        });
    }
    // stop the timer when countDown reach zero
    stopCountDown(id: string): void {
        if (this.countDown === 0) {
            this.stopChronometer(id);
        }
    }

    // increment time should not exceed 2 minutes
    incrementTime(): void {
        if (this.tamponTime + this.timeIncrement > MAX_COUNTDOWN) {
            this.tamponTime = MAX_COUNTDOWN;
        }
        this.tamponTime += this.timeIncrement;
    }

    // decrement time should not be below 0, if equal zero, stop chronometer
    decrementTime(id: string): void {
        if (this.tamponTime - this.hintPenalty < 0) {
            this.tamponTime = 0;
            this.stopChronometer(id);
        } else {
            this.tamponTime -= this.hintPenalty;
        }
    }

    stopChronometer(id: string): number {
        this.timers[id].unsubscribe();
        const time = this.elapsedTimes.get(id);
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
        this.elapsedTimes.clear();
        this.elapsedTime = 0;
        // unsubscribe to every timers
        Object.keys(this.timers).forEach((key) => {
            this.timers[key].unsubscribe();
        });
    }

    removeTimer(id: string): void {
        this.timers[id].unsubscribe();
        this.elapsedTimes.delete(id);
    }
}
