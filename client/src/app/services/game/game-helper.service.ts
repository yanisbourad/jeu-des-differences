import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import * as constantsTime from '@app/configuration/const-time';
import { ImagePath } from '@app/interfaces/hint-diff-path';
import { Message } from '@app/interfaces/message';
import { SocketClientService } from '@app/services/socket/socket-client.service';
import { GameRecord } from '@common/game';

@Injectable({
    providedIn: 'root',
})
// to contain various helpful functions
export class GameHelperService {
    path: ImagePath;
    playerName: string;
    gameName: string;
    gameType: string;
    message: string;
    winnerMessage: { message: string; playerName: string; color: string; pos: string; gameId: string; event: boolean };
    subMessage: { playerName: string; color: string; pos: string; gameId: string; event: boolean };
    constructor(private socket: SocketClientService, private dialog: MatDialog) {
        this.path = {
            differenceNotFound: './assets/img/difference-not-found.png',
            differenceFound: './assets/img/difference-found.png',
        };
    }

    getGameTime(gameTime: number): string {
        const minutes = Math.floor(gameTime / constantsTime.MIN_TO_SEC);
        const seconds = gameTime - minutes * constantsTime.MIN_TO_SEC;
        return `${minutes}:${seconds < constantsTime.UNIT ? '0' : ''}${seconds}`;
    }

    displayGameEnded(data: { msg: string; type: string; time?: string; mode?: string }) {
        this.dialog.open(MessageDialogComponent, {
            data: { message: data.msg, type: data.type, formatTime: data.time, mode: data.mode },
            disableClose: true,
            minWidth: 'fit-content',
            minHeight: 'fit-content',
            panelClass: 'custom-dialog-container',
        });
    }

    displayGiveUp(msg: string, type: string): void {
        this.dialog.open(MessageDialogComponent, {
            data: { message: msg, type },
            minWidth: 'fit-content',
            minHeight: 'fit-content',
            panelClass: 'custom-dialog-container',
        });
    }

    sendFoundMessage(): Message {
        this.message = new Date().toLocaleTimeString() + ' - ' + ' Différence trouvée';
        if (this.gameType === 'double') this.message = this.message + ' par ' + this.playerName;
        const foundMessage = { message: this.message, ...this.subMessage };
        this.socket.sendMessage(foundMessage);
        return { ...foundMessage, mine: true };
    }

    sendErrorMessage(): Message {
        this.message = new Date().toLocaleTimeString() + ' - ' + ' Erreur';
        if (this.gameType === 'double') this.message = this.message + ' par ' + this.playerName;
        const errorMessage = { message: this.message, ...this.subMessage };
        this.socket.sendMessage(errorMessage);
        return { ...errorMessage, mine: true };
    }

    sendWinnerMessage(position: number): void {
        const positions = ['', 'première', 'deuxième', 'troisième'];
        const msg = ` obtient la ${positions[position]} position dans les meilleurs temps du jeu`;
        this.message = new Date().toLocaleTimeString() + ' - ' + this.playerName + msg + this.gameName + ' en ' + this.gameType;
        this.winnerMessage = {
            message: this.message,
            playerName: 'meilleur temps',
            color: '#FF0000',
            pos: '50%',
            gameId: this.socket.getRoomName(),
            event: true,
        };
        this.socket.sendMessage(this.winnerMessage);
        this.socket.messageList.push({ ...this.winnerMessage, mine: true });
    }

    globalMessage(gameTime: number, rankingCopy: GameRecord[]) {
        const gameTimeMinute = parseInt(this.getGameTime(gameTime).slice(0, 2), 10);
        const gameTimeSec = parseInt(this.getGameTime(gameTime).slice(2), 10);
        for (let i = 0; i < rankingCopy.length; i++) {
            const rankingMinute = parseInt(rankingCopy[i].time.slice(0, 2), 10);
            const rankingSec = parseInt(rankingCopy[i].time.slice(2), 10);
            if (gameTimeMinute <= rankingMinute) {
                if (gameTimeMinute === rankingMinute) {
                    if (gameTimeSec <= rankingSec) {
                        this.sendWinnerMessage(i + 1);
                        return;
                    }
                } else {
                    this.sendWinnerMessage(i + 1);
                    return;
                }
            }
        }
    }
}
