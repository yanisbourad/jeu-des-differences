import { Component, Input, OnInit } from '@angular/core';
import { Time } from '@app/interfaces/time';
import { TimeService } from '@app/services/time.service';
import * as constants from '@app/configuration/const-time';
@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit {
    @Input() isClassicMode: boolean = false; // can be classique or temps limite
    time: Time;

    constructor(private readonly timeService: TimeService) {
        this.time = { minute: constants.DEFAULT_TIME, second: constants.DEFAULT_TIME };
    }

    ngOnInit(): void {
        this.isClassicMode ? this.timeService.startTimer() : this.timeService.startCountDown();
    }

    formatTime(): string {
        return (
            (this.time.minute < constants.UNDER_TEN ? '0' + this.time.minute : this.time.minute) +
            ':' +
            (this.time.second < constants.UNDER_TEN ? '0' + this.time.second : this.time.second)
        );
    }

    transformCountDown(): string {
        this.time.second = this.timeService.getCountDown() % constants.SIXTY_SECOND;
        this.time.minute = Math.floor(this.timeService.getCountDown() / constants.SIXTY_SECOND);
        if (this.time.second === constants.ZERO && this.time.minute === constants.ZERO) {
            this.timeService.stopTimer();
            return this.time.second < constants.UNDER_TEN || this.time.minute < constants.UNDER_TEN
                ? this.formatTime()
                : this.time.minute + ':' + this.time.second;
        } else {
            return this.time.second < constants.UNDER_TEN || this.time.minute < constants.UNDER_TEN
                ? this.formatTime()
                : this.time.minute + ':' + this.time.second;
        }
    }

    transform(): string {
        this.time.second = this.timeService.getCount() % constants.SIXTY_SECOND;
        this.time.minute = Math.floor(this.timeService.getCount() / constants.SIXTY_SECOND);
        return this.time.second < constants.UNDER_TEN || this.time.minute < constants.UNDER_TEN
            ? this.formatTime()
            : this.time.minute + ':' + this.time.second;
    }
}
