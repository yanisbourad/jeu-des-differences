import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket/socket-client.service';
import { Message } from '@app/interfaces/message';

export interface ImagePathHints {
    hintsNotUsed: string;
    hintsUsed: string;
}

@Injectable({
    providedIn: 'root',
})
export class HintsDisplayService {
    path: ImagePathHints;
    hintsArray: string[] = [];
    totalHints: number = 3;
    message: string;
    subMessage: { playerName: string; color: string; pos: string; gameId: string; event: boolean };

    constructor(private socket: SocketClientService) {
        this.hintsArray = new Array(this.totalHints);
        this.path = {
            hintsNotUsed: './assets/img/hint-not-used.png',
            hintsUsed: './assets/img/hint-used.png',
        };
        this.setIcons();
        this.subMessage = {
            playerName: '',
            color: '#00FF00',
            pos: '50%',
            gameId: this.socket.getRoomName(),
            event: true,
        };
    }

    setIcons(): void {
        for (let i = 0; i < this.totalHints; i++) {
            this.hintsArray[i] = this.path.hintsNotUsed;
        }
    }

    updateIcons(): void {
        this.hintsArray.shift();
        this.hintsArray.push(this.path.hintsUsed);
    }

    sendHintMessage(): Message {
        this.message = new Date().toLocaleTimeString() + ' - ' + ' Indice utilisé';
        const hintMessage = { message: this.message, ...this.subMessage };
        this.socket.sendMessage(hintMessage);
        return { ...hintMessage, mine: true };
    }
}
