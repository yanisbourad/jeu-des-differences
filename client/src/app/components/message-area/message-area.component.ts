import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-message-area',
    templateUrl: './message-area.component.html',
    styleUrls: ['./message-area.component.scss'],
})
export class MessageAreaComponent implements OnInit {
    date: Date = new Date();
    playerName: string = 'Daniel';
    playerInitials: string = this.playerName[0];
    chatBoxDemo: number = 26;
    chatBox: number[] = new Array(this.chatBoxDemo);
    constructor() {}
    ngOnInit(): void {}
    getTimestamp(): string {
        return this.date.toLocaleTimeString();
    }
}
