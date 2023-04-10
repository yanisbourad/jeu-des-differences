import { Injectable } from '@angular/core';
import * as constantsTime from '@app/configuration/const-time';
import { GameRecord } from '@common/game';
import { SocketClientService } from '@app/services/socket/socket-client.service';
import { ImagePath } from '@app/interfaces/hint-diff-path';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Message } from '@app/interfaces/message';

@Injectable({
    providedIn: 'root',
})
// to contain various helpful functions
export class GameHelperService {
    path: ImagePath;
    rankingSoloCopy: GameRecord[];
    rankingMultiCopy: GameRecord[];
    playerName: string;
    gameName: string;
    gameType: string;
    message: string;
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

    displayGameEnded(msg: string, type: string, time?: string) {
        this.dialog.open(MessageDialogComponent, {
            data: { message: msg, type, formatTime: time },
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
        if (this.gameType === 'double') {
            this.message = this.message + ' par ' + this.playerName;
        }
        const foundMessage = {
            message: this.message,
            playerName: this.playerName,
            color: '#00FF00',
            pos: '50%',
            gameId: this.socket.getRoomName(),
            event: true,
        };
        this.socket.sendMessage(foundMessage);
        return {
            message: foundMessage.message,
            userName: foundMessage.playerName,
            mine: true,
            color: foundMessage.color,
            pos: foundMessage.pos,
            event: foundMessage.event,
        };
    }

    sendErrorMessage(): Message {
        this.message = new Date().toLocaleTimeString() + ' - ' + ' Erreur';
        if (this.gameType === 'double') {
            this.message = this.message + ' par ' + this.playerName;
        }
        const errorMessage = {
            message: this.message,
            playerName: this.playerName,
            color: '#FF0000',
            pos: '50%',
            gameId: this.socket.getRoomName(),
            event: true,
        };
        this.socket.sendMessage(errorMessage);

        return {
            message: errorMessage.message,
            userName: errorMessage.playerName,
            mine: true,
            color: errorMessage.color,
            pos: errorMessage.pos,
            event: errorMessage.event,
        };
    }

    sendWinnerMessage(position: number): void {
        let msg = '';
        switch (position) {
            case 1:
                msg = ' obtient la première position dans les meilleurs temps du jeu ';
                break;
            case 2:
                msg = ' obtient la deuxième position dans les meilleurs temps du jeu ';
                break;
            case 3:
                msg = ' obtient la troisième dans les meilleurs temps du jeu ';
                break;
            default:
                break;
        }
        this.message = new Date().toLocaleTimeString() + ' - ' + this.playerName + msg + this.gameName + ' en ' + this.gameType;
        const winnerMessage = {
            message: this.message,
            playerName: 'meilleur temps',
            color: '#FF0000',
            pos: '50%',
            gameId: this.socket.getRoomName(),
            event: true,
        };
        this.socket.sendMessage(winnerMessage);
        this.socket.messageList.push({
            message: winnerMessage.message,
            userName: winnerMessage.playerName,
            mine: true,
            color: winnerMessage.color,
            pos: winnerMessage.pos,
            event: winnerMessage.event,
        });
    }

    globalMessageMulti(gameTime: number) {
        if (parseInt(this.getGameTime(gameTime).slice(0, 2), 10) <= parseInt(this.rankingMultiCopy[0].time.slice(0, 2), 10)) {
            if (parseInt(this.getGameTime(gameTime).slice(0, 2), 10) === parseInt(this.rankingMultiCopy[0].time.slice(0, 2), 10)) {
                if (parseInt(this.getGameTime(gameTime).slice(2), 10) <= parseInt(this.rankingMultiCopy[0].time.slice(2), 10)) {
                    this.sendWinnerMessage(1);
                    return;
                }
            } else {
                this.sendWinnerMessage(1);
                return;
            }
        }
        if (parseInt(this.getGameTime(gameTime).slice(0, 2), 10) <= parseInt(this.rankingMultiCopy[1].time.slice(0, 2), 10)) {
            if (parseInt(this.getGameTime(gameTime).slice(0, 2), 10) === parseInt(this.rankingMultiCopy[1].time.slice(0, 2), 10)) {
                if (parseInt(this.getGameTime(gameTime).slice(2), 10) <= parseInt(this.rankingMultiCopy[1].time.slice(2), 10)) {
                    this.sendWinnerMessage(2);
                    return;
                }
            } else {
                this.sendWinnerMessage(2);
                return;
            }
        }
        if (parseInt(this.getGameTime(gameTime).slice(0, 2), 10) <= parseInt(this.rankingMultiCopy[2].time.slice(0, 2), 10)) {
            if (parseInt(this.getGameTime(gameTime).slice(0, 2), 10) === parseInt(this.rankingMultiCopy[2].time.slice(0, 2), 10)) {
                if (parseInt(this.getGameTime(gameTime).slice(2), 10) <= parseInt(this.rankingMultiCopy[2].time.slice(2), 10)) {
                    this.sendWinnerMessage(3);
                    return;
                }
            } else {
                this.sendWinnerMessage(3);
                return;
            }
        }
    }

    globalMessageSolo(gameTime: number) {
        if (parseInt(this.getGameTime(gameTime).slice(0, 2), 10) <= parseInt(this.rankingSoloCopy[0].time.slice(0, 2), 10)) {
            if (parseInt(this.getGameTime(gameTime).slice(0, 2), 10) === parseInt(this.rankingSoloCopy[0].time.slice(0, 2), 10)) {
                if (parseInt(this.getGameTime(gameTime).slice(2), 10) <= parseInt(this.rankingSoloCopy[0].time.slice(2), 10)) {
                    this.sendWinnerMessage(1);
                    return;
                }
            } else {
                this.sendWinnerMessage(1);
                return;
            }
        }
        if (parseInt(this.getGameTime(gameTime).slice(0, 2), 10) <= parseInt(this.rankingSoloCopy[1].time.slice(0, 2), 10)) {
            if (parseInt(this.getGameTime(gameTime).slice(0, 2), 10) === parseInt(this.rankingSoloCopy[1].time.slice(0, 2), 10)) {
                if (parseInt(this.getGameTime(gameTime).slice(2), 10) <= parseInt(this.rankingSoloCopy[1].time.slice(2), 10)) {
                    this.sendWinnerMessage(2);
                    return;
                }
            } else {
                this.sendWinnerMessage(2);
                return;
            }
        }
        if (parseInt(this.getGameTime(gameTime).slice(0, 2), 10) <= parseInt(this.rankingSoloCopy[2].time.slice(0, 2), 10)) {
            if (parseInt(this.getGameTime(gameTime).slice(0, 2), 10) === parseInt(this.rankingSoloCopy[2].time.slice(0, 2), 10)) {
                if (parseInt(this.getGameTime(gameTime).slice(2), 10) <= parseInt(this.rankingSoloCopy[2].time.slice(2), 10)) {
                    this.sendWinnerMessage(3);
                    return;
                }
            } else {
                this.sendWinnerMessage(3);
                return;
            }
        }
    }
}
