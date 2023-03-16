import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game.service';
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
    winner: string = this.gameService.playerName;

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
            const dataToSend = {
                message: this.gameService.playerName + ' a quitté la partie',
                playerName: this.gameService.playerName,
                color: '#FF0000',
                pos: '50%',
                gameId: this.socket.getRoomName(),
                event: true,
            };
            this.socket.sendMessage(dataToSend);
            this.socket.messageList.push({
                message: this.gameService.playerName + ' a quitté la partie',
                userName: this.gameService.playerName,
                mine: true,
                color: '#FF0000',
                pos: '50%',
                event: true,
            });
        }
        this.router.navigate(['/home']);
        this.socket.leaveRoom();
    }
}
