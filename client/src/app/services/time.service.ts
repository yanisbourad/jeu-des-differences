import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    count: number = 0;
    countDown: number = 30; // from database or something else. The time must be transformed to second before being processed
    time: number | unknown;

    constructor() {}

    addTime(time: number, classical: boolean): void {
        classical ? (this.count += time) : (this.countDown += time);
    }

    decreaseTime(time: number): void {
        this.countDown -= time;
    }

    startTimer(): void {
        this.time = setInterval(() => {
            this.count++;
        }, 1000);
    }

    startCountDown(): number {
        this.time = setInterval(() => {
            this.countDown--;
        }, 1000);
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
