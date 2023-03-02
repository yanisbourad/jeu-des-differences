import { Component } from '@angular/core';
import * as constants from '@app/configuration/const-time';
import { Time } from '@app/interfaces/time';
import { ClientTimeService } from '@app/services/client-time.service';
@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent {
    time: Time;
    constructor(readonly clientTimeService: ClientTimeService) {
        this.time = { minute: 0, second: 0 };
    }

    formatTime(): string {
        return (
            (this.time.minute < constants.UNDER_TEN ? '0' + this.time.minute : this.time.minute) +
            ':' +
            (this.time.second < constants.UNDER_TEN ? '0' + this.time.second : this.time.second)
        );
    }

    transform(): string {
        this.setTime();
        return this.time.second < constants.UNDER_TEN || this.time.minute < constants.UNDER_TEN
            ? this.formatTime()
            : this.time.minute + ':' + this.time.second;
    }

    setTime(): void {
        this.time.second = this.getSecond();
        this.time.minute = this.getMinute();
    }
    getSecond(): number {
        return this.clientTimeService.getCount() ? Number(this.clientTimeService.getCount() % constants.SIXTY_SECOND) : 0;
    }
    getMinute(): number {
        return this.clientTimeService.getCount() ? Number(Math.floor(this.clientTimeService.getCount() / constants.SIXTY_SECOND)) : 0;
    }
}
