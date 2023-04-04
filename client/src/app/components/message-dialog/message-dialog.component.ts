import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameMessageEvent } from '@app/classes/game-records/message-event';
import { GameRecorderService } from '@app/services/game-recorder.service';
import { GameService } from '@app/services/game.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { PlayerWaitPopupComponent } from '@app/components//player-wait-popup/player-wait-popup.component';
import { GeneralFeedbackComponent } from '@app/components/general-feedback/general-feedback.component';
import { GameDatabaseService } from '@app/services/game-database.service';

@Component({
    selector: 'app-message-dialog',
    templateUrl: './message-dialog.component.html',
    styleUrls: ['./message-dialog.component.scss'],
})
export class MessageDialogComponent {
    winner: string = this.gameService.playerName;
    // eslint-disable-next-line max-params
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { message: string; type: string; formatTime: string; playerName: string },
        private router: Router,
        readonly socket: SocketClientService,
        readonly gameService: GameService,
        public dialog: MatDialog,
        private gameRecorderService: GameRecorderService,
        private gameDataBaseService: GameDatabaseService,
    ) {
        this.gameDataBaseService.isDataBaseEmpty();
    }

    rewindGame() {
        this.socket.leaveRoom();
        this.gameRecorderService.rewindSpeed = 1;
        this.gameRecorderService.startRewind();
    }

    launchSolo(): void {
        if (this.gameDataBaseService.isEmpty) {
            this.launchFeedback("Il n'y a pas de jeu disponible. Veuillez en créer un pour commencer à jouer");
        } else {
            this.router.navigate(['/game', { player: this.data.playerName, gameType: 'solo', mode: 'tempsLimite' }]);
        }
    }

    launchFeedback(showedMessage: string): void {
        this.dialog.open(GeneralFeedbackComponent, {
            data: { message: showedMessage },
            disableClose: true,
        });
    }

    launchCooperatif(): void {
        this.dialog.open(PlayerWaitPopupComponent, {
            data: { name: this.data.playerName, gameType: 'tempsLimite' },
            disableClose: true,
            height: '600px',
            width: '600px',
        });
    }

    redirection(): void {
        if (this.data.type === 'giveUp') {
            this.socket.sendGiveUp({
                playerName: this.gameService.playerName,
                roomName: this.socket.getRoomName(),
            });
            const dataToSend = {
                message: new Date().toLocaleTimeString() + ' - ' + this.gameService.playerName + ' a abandonné la partie.',
                playerName: this.gameService.playerName,
                color: '#FF0000',
                pos: '50%',
                gameId: this.socket.getRoomName(),
                event: true,
            };
            this.socket.sendMessage(dataToSend);
            new GameMessageEvent({
                message: new Date().toLocaleTimeString() + ' - ' + this.gameService.playerName + ' a abandonné la partie.',
                userName: this.gameService.playerName,
                mine: true,
                color: '#FF0000',
                pos: '50%',
                event: true,
            }).record(this.gameRecorderService);
        }
        this.socket.leaveRoom();
        this.router.navigate(['/home']);
    }
}
