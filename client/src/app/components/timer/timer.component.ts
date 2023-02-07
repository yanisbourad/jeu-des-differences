import { Component, OnInit } from '@angular/core';
import { Time } from '@app/interfaces/time';
import { ClientTimeService } from '@app/services/client-time.service';
@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit {
    time: Time;
    roomName: string = "test7 room";

    constructor(public readonly clientTimeService: ClientTimeService) {
        this.time = { minute: 0, second: 0 };
    }

    ngOnInit(): void {
        console.log('timer component');
    }

    formatTime(): string {
        return (
            (this.time.minute < 10 ? '0' + this.time.minute : this.time.minute) +
            ':' +
            (this.time.second < 10 ? '0' + this.time.second : this.time.second)
        );
    }

    transform(): string {
        this.setTime();
        return this.time.second < 10 || this.time.minute < 10 ? this.formatTime() : this.time.minute + ':' + this.time.second;
    }

   setTime(): void {
        this.time.second = Number(this.clientTimeService.getCount() % 60)|0;
        this.time.minute = Number(Math.floor(this.clientTimeService.getCount() / 60))|0;
    }
}
