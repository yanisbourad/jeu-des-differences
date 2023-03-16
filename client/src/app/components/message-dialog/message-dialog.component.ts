import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketClientService } from '@app/services/socket-client.service';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-message-dialog',
    templateUrl: './message-dialog.component.html',
    styleUrls: ['./message-dialog.component.scss'],
})
export class MessageDialogComponent {
    message: string;
    type: string;
    formatTime: string;

    constructor(
        @Inject(MAT_DIALOG_DATA) data: string,
        private router: Router,
        private readonly socket: SocketClientService,
        private readonly gameService: GameService,
        public dialog: MatDialog,
    ) {
        this.message = data[0];
        this.type = data[1];
        this.formatTime = data[2];
    }

    redirection(): void {
        if (this.type === 'giveUp') {
            this.socket.sendGiveUp({
                playerName: this.gameService.playerName,
                roomName: this.socket.getRoomName(),
            });
        }
        // this.socket.leaveRoom();
        this.router.navigate(['/home']);
    }
}
