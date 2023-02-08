import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ClientTimeService } from '@app/services/client-time.service';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-message-dialog',
    templateUrl: './message-dialog.component.html',
    styleUrls: ['./message-dialog.component.scss'],
})
export class MessageDialogComponent implements OnInit {
    message: string;
    type: string;
    time: number;

    constructor(
        @Inject(MAT_DIALOG_DATA) data: string,
        private router: Router,
        private readonly socket: SocketClientService,
        private readonly clientTimeService: ClientTimeService,
    ) {
        this.message = data[0];
        this.type = data[1];
        this.time = Number(data[2]);
    }
    ngOnInit(): void {
        console.log(this.time);
    }

    formatTime(): string {
        const minutes = Math.floor(this.time / 60);
        const seconds = this.time - minutes * 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    redirection(): void {
        this.router.navigate(['/home']);
        this.socket.leaveRoom(this.socket.getRoomName());
        this.clientTimeService.resetTimer();
    }
}
