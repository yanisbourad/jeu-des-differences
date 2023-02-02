import { Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
    count: number = 0;
    countDown: number = 30; // from database or something else. The time must be transformed to second before being processed
    time: unknown;

    startTimer(): void {
        setInterval(() => {
            this.count++;
        }, 1000);
        console.log('timer start');
    }

    startCountDown(): number {
        this.time = setInterval(() => {
            this.countDown--;
        }, 1000);
        return this.countDown;
    }

    addTime(time: number, classical: boolean): void {
        classical ? (this.count += time) : (this.countDown += time);
    }

    decreaseTime(time: number): void {
        this.countDown -= time;
    }

    getCount(): number {
        return this.count;
    }

    getCountDown(): number {
        return this.countDown;
    }

    stopTimer(): void {
        clearInterval(this.time);
    }

    setCountDown(time: number): void {
        this.countDown = time;
    }

    currentTime(): string {
        return new Date().toString();
    }
}
