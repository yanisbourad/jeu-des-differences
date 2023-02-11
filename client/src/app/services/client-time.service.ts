import { Injectable } from '@angular/core';
import { delayBeforeEmittingTime } from '@app/configuration/const-time';
@Injectable({
    providedIn: 'root',
})
export class ClientTimeService {
    count: number = 0;
    time: number | unknown;

    startTimer(): void {
        this.time = setInterval(() => {
            this.count++;
        }, delayBeforeEmittingTime);
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
