import { Injectable } from '@angular/core';
import { DELAY_BEFORE_EMITTING_TIME } from '../../../../server/app/gateways/chat/chat.gateway.constants';
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
