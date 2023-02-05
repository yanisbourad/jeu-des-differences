import { Injectable } from '@nestjs/common';
import { DELAY_BEFORE_EMITTING_TIME } from '@app/gateways/chat/chat.gateway.constants';

@Injectable()
export class TimeService {
    count: number = 0;
    countDown: number = 0; // from database or something else. The time must be transformed to second before being processed
    time: number | unknown; // probably find something else

    timers: { [key: string]: any } = {};

    setTimer(id: string, callback: () => void) {
        this.timers[id] = setInterval(callback, DELAY_BEFORE_EMITTING_TIME);
    }

    stopTimer(id: string) {
        clearInterval(this.timers[id]);
    }

    // setTimers(id: string, callback: (count: number) => void) {
    //     let count = 0;
    //     this.timers[id] = setInterval(() => {
    //       count++;
    //       callback(count);
    //     }, DELAY_BEFORE_EMITTING_TIME);
    //   }
    //startTimer1() {
    //     this.timerService.setTimer(this.timer1Id, (count) => {
    //       this.timer1Count = count;
    //     }, 1000, 10);
    //   }
    

    // startTimer1() {
    //     this.timerService.setTimer(this.timer1Id, () => console.log('Timer 1'), 1000);
    //   }
    
    // startTimer2() {
    //     this.timerService.setTimer(this.timer2Id, () => console.log('Timer 2'), 2000);
    //   }

    addTime(time: number, isClassical: boolean): void {
        if (isClassical) this.count += Number(time);
        else this.countDown += Number(time);
    }

    decreaseTime(time: number): void {
        this.countDown -= time;
    }

    startTimer(): void {
        this.time = setInterval(() => {
            this.count++;
        }, DELAY_BEFORE_EMITTING_TIME);
    }

    startCountDown(): number {
        this.time = setInterval(() => {
            this.countDown--;
        }, DELAY_BEFORE_EMITTING_TIME);
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

    // stopTimer(): void {
    //     clearInterval(this.time as number);
    // }

    resetTimer(): void {
        this.count = 0;
        this.countDown = 0;
    }
}
