import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
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

    constructor(@Inject(MAT_DIALOG_DATA) data: string, private router: Router, private readonly socket: SocketClientService) {
        this.message = data[0];
        this.type = data[1];
        this.formatTime = data[2];
    }

    redirection(): void {
        this.router.navigate(['/home']);
        this.socket.leaveRoom();
    }
}
