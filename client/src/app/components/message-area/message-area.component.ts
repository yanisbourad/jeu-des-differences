import { Component } from '@angular/core';
import * as constants from '@app/configuration/const-game';

@Component({
    selector: 'app-message-area',
    templateUrl: './message-area.component.html',
    styleUrls: ['./message-area.component.scss'],
})
export class MessageAreaComponent {
    date: Date = new Date();
    playerName: string = 'Daniel';
    playerInitials: string = this.playerName[0];
    chatBoxDemo: number = constants.chatBoxDemo;
    chatBox: number[] = new Array(this.chatBoxDemo);
    getTimestamp(): string {
        return this.date.toLocaleTimeString();
    }
}
