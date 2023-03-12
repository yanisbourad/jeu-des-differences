import { Injectable } from '@nestjs/common';
import { DELAY_BEFORE_EMITTING_TIME } from '@common/const-chat-gateway';
import { interval, Subscription } from 'rxjs';
// eslint-disable-next-line import/no-unresolved
import { Service } from 'typedi';

@Injectable()
@Service()
export class ServerTimeService {
    elapsedTime: number = 0;
    timers: { [key: string]: Subscription } = {};
    elapsedTimes: Map<string, number> = new Map<string, number>();

    startChronometer(id: string): void {
        let count = 0;
        this.timers[id] = interval(DELAY_BEFORE_EMITTING_TIME).subscribe(() => {
            count++;
            this.elapsedTimes.set(id, count);
        });
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
    }

    removeTimer(id: string): void {
        this.timers[id].unsubscribe();
        this.elapsedTimes.delete(id);
    }
}
