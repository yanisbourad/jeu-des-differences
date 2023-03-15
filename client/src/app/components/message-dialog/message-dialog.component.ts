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

    // TODO: reduce the number of constructor parameters
    // eslint-disable-next-line max-params
    constructor(@Inject(MAT_DIALOG_DATA) data: string, private router: Router, private socket: SocketClientService, readonly gameServ: GameService) {
        this.message = data[0];
        this.type = data[1];
        this.formatTime = data[2];
    }

    redirection(): void {
        this.socket.sendMessage(
            this.gameServ.playerName + ' a quitté la partie',
            this.gameServ.playerName,
            '#FF0000',
            '50%',
            this.gameServ.gameId,
            true,
        );
        this.socket.messageList.push({
            message: this.gameServ.playerName + ' a quitté la partie',
            userName: this.gameServ.playerName,
            mine: true,
            color: '#FF0000',
            pos: '50%',
            event: true,
        });
        this.router.navigate(['/home']);
        this.socket.leaveRoom();
    }
}
