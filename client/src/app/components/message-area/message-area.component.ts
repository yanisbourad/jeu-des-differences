import { Component, Input, OnInit } from '@angular/core';
import * as constants from '@app/configuration/const-game';

@Component({
    selector: 'app-message-area',
    templateUrl: './message-area.component.html',
    styleUrls: ['./message-area.component.scss'],
})
export class MessageAreaComponent implements OnInit {
    @Input() playerName: string = '';
    playerInitials: string;
    date: Date = new Date();
    chatBoxDemo: number = constants.CHAT_BOX_DEMO;
    chatBox: number[] = new Array(this.chatBoxDemo);

    ngOnInit() {
        this.playerInitials = this.playerName[0];
    }

    getTimestamp(): string {
        return this.date.toLocaleTimeString();
    }
}
