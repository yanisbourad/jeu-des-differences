import { Injectable } from '@angular/core';
// TODO: move this constant to common
import { DELAY_BEFORE_EMITTING_TIME } from '@common/const-chat-gateway';
@Injectable({
    providedIn: 'root',
})
export class ClientTimeService {
    count: number = 0;
    time: number | unknown;

    startTimer(): void {
        this.time = setInterval(() => {
            this.count++;
        }, DELAY_BEFORE_EMITTING_TIME);
    }

    getCount(): number {
        return this.count;
    }

    stopTimer(): void {
        clearInterval(this.time as number);
    }

    resetTimer(): void {
        this.count = 0;
    }
}
