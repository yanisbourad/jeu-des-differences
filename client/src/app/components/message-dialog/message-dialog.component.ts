import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameMessageEvent } from '@app/classes/game-records/message-event';
import { PlayerWaitPopupComponent } from '@app/components//player-wait-popup/player-wait-popup.component';
import { GeneralFeedbackComponent } from '@app/components/general-feedback/general-feedback.component';
import * as constantsTime from '@app/configuration/const-time';
import { GameCardHandlerService } from '@app/services/game/game-card-handler-service.service';
import { GameRecorderService } from '@app/services/game/game-recorder.service';
import { GameService } from '@app/services/game/game.service';
import { SocketClientService } from '@app/services/socket/socket-client.service';

@Component({
    selector: 'app-message-dialog',
    templateUrl: './message-dialog.component.html',
    styleUrls: ['./message-dialog.component.scss'],
})
export class MessageDialogComponent {
    winner: string = this.gameService.playerName;
    gameCount: number;
    // eslint-disable-next-line max-params
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: { name: string; gameName: string; message: string; gameType: string; formatTime: string; type: string; mode?: string },
        private router: Router,
        readonly socket: SocketClientService,
        readonly gameService: GameService,
        public dialog: MatDialog,
        private gameRecorderService: GameRecorderService,
        private gameCardHandlerService: GameCardHandlerService,
    ) {}

    rewindGame() {
        this.socket.leaveRoom();
        this.gameRecorderService.rewindSpeed = 1;
        this.gameRecorderService.startRewind();
    }

    launchSolo(): void {
        this.socket.connect();
        this.socket.startTimeLimit(this.gameService.playerName);
        setTimeout(() => {
            this.router.navigate(['/game', { player: this.data.name, gameType: 'solo', mode: 'tempsLimite' }]);
        }, constantsTime.LOADING);
    }

    launchFeedback(showedMessage: string): void {
        this.dialog.open(GeneralFeedbackComponent, {
            data: { message: showedMessage },
            disableClose: true,
        });
    }

    launchCooperation(): void {
        this.gameCardHandlerService.connect();
        this.dialog.open(PlayerWaitPopupComponent, {
            data: { name: this.data.name, gameName: this.data.gameName, gameType: 'tempsLimite' },
            disableClose: true,
            panelClass: 'custom-dialog-container',
            minHeight: 'fit-content',
            minWidth: 'fit-content',
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
                ...dataToSend,
                mine: true,
            }).record(this.gameRecorderService);
        }
        this.socket.leaveRoom();
        this.router.navigate(['/home']);
    }
}
