import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
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
    winner: string = this.gameServ.playerName;

    // TODO: reduce the number of constructor parameters
    // eslint-disable-next-line max-params
    constructor(@Inject(MAT_DIALOG_DATA) data: string, private router: Router, private socket: SocketClientService, readonly gameServ: GameService) {
        this.message = data[0];
        this.type = data[1];
        this.formatTime = data[2];
    }

    redirection(): void {
        if (this.type === 'giveUp') {
            const dataToSend = {
                message: this.gameServ.playerName + ' a quitté la partie',
                playerName: this.gameServ.playerName,
                color: '#FF0000',
                pos: '50%',
                gameId: this.socket.getRoomName(),
                event: true,
            };
            this.socket.sendMessage(dataToSend);
            this.socket.messageList.push({
                message: this.gameServ.playerName + ' a quitté la partie',
                userName: this.gameServ.playerName,
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
