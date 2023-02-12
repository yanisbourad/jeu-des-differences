import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ClientTimeService } from '@app/services/client-time.service';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-message-dialog',
    templateUrl: './message-dialog.component.html',
    styleUrls: ['./message-dialog.component.scss'],
})
export class MessageDialogComponent {
    message: string;
    type: string;
    formatTime: string;

    // TODO: reduce the number of constructor parameters
    constructor(
        @Inject(MAT_DIALOG_DATA) data: string,
        private router: Router,
        private readonly socket: SocketClientService,
        private readonly clientTimeService: ClientTimeService,
    ) {
        this.message = data[0];
        this.type = data[1];
        this.formatTime = data[2];
    }

    redirection(): void {
        this.router.navigate(['/home']);
        this.socket.leaveRoom();
        this.clientTimeService.resetTimer();
    }
}
