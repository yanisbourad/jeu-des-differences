import { Injectable } from '@angular/core';
import * as constants from '@app/configuration/const-time';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    count: number = 0;
    countDown: number = constants.SIXTY_SECOND; // from database or something else. The time must be transformed to second before being processed
    time: number | unknown; // need this to stop the time later on // is there another way?

    addTime(time: number, classical: boolean): void {
        classical ? (this.count += time) : (this.countDown += time);
    }

    decreaseTime(time: number): void {
        this.countDown -= time;
    }

    startTimer(): void {
        this.time = setInterval(() => {
            this.count++;
        }, constants.DELAY_BEFORE_EMITTING_TIME);
    }
    startCountDown(): number {
        this.time = setInterval(() => {
            this.countDown--;
        }, constants.DELAY_BEFORE_EMITTING_TIME);
        return this.countDown;
    }

    getCount(): number {
        return this.count;
    }

    getCountDown(): number {
        return this.countDown;
    }

    setCountDown(time: number): void {
        this.countDown = time;
    }

    stopTimer(): void {
        clearInterval(this.time as number);
    }
}
