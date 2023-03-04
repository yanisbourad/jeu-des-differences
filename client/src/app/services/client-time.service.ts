import { Injectable } from '@angular/core';
import { RoomTime } from '@app/interfaces/room-time';
import { DELAY_BEFORE_EMITTING_TIME } from '@common/const-chat-gateway';
import { interval, Subscription } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class ClientTimeService {
    count: number = 0;
    time: number | unknown;
    serverTime: RoomTime[] = [];
    roomName: string;
    elapsedTime: number = 0;
    private chronometer: Subscription = new Subscription();

    getServerTimeIndex(roomName: string): number {
        return this.serverTime.findIndex((roomTime) => roomTime.id === roomName);
    }

    getServerTime(): RoomTime[] {
        return this.serverTime;
    }

    getRoomTime(roomName: string): number {
        return this.serverTime[this.getServerTimeIndex(roomName)]?.time;
    }

    startChronometer(): void {
        this.chronometer = interval(DELAY_BEFORE_EMITTING_TIME).subscribe(() => {
            this.elapsedTime++;
        });
    }

    stopChronometer(): number {
        this.chronometer.unsubscribe();
        const time = this.elapsedTime;
        this.elapsedTime = 0;
        return time;
    }

    getElapsedTime(): number {
        return this.elapsedTime;
    }

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
