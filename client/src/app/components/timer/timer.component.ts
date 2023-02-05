import { Component, Input, OnInit } from '@angular/core';
import { Time } from '@app/interfaces/time';
import { SocketClientService } from '@app/services/socket-client.service';
@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit {
    @Input() isClassicMode: boolean = false; // can be classique or temps limite
    @Input() serverTime: number = 0;
    time: Time;
    roomName: string = "test5 room";

    constructor(private readonly socketService: SocketClientService) {
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

    transformCountDown(): string {
        this.setTime();
        if (this.time.second === 0 && this.time.minute === 0) {
          //  this.socketService.stopTimer();
            return this.time.second < 10 || this.time.minute < 10 ? this.formatTime() : this.time.minute + ':' + this.time.second;
        } else {
            return this.time.second < 10 || this.time.minute < 10 ? this.formatTime() : this.time.minute + ':' + this.time.second;
        }
    }

    transform(): string {
        this.setTime();
        return this.time.second < 10 || this.time.minute < 10 ? this.formatTime() : this.time.minute + ':' + this.time.second;
    }

    setTime(): void {
        console.log('setTime', this.socketService.getRoomTime(this.roomName));
        this.time.second = Number(this.socketService.getRoomTime(this.roomName) % 60) | 0;
        this.time.minute = Number(Math.floor(this.socketService.getRoomTime(this.roomName) / 60)) | 0;
    }
}
