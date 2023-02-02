import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-message-area',
    templateUrl: './message-area.component.html',
    styleUrls: ['./message-area.component.scss'],
})
export class MessageAreaComponent implements OnInit {
    playerName: string = 'Daniel';
    playerInitials: string = this.playerName[0];
    eventMessageArray: string[] = new Array();
    test: number[] = new Array(25);
    constructor() {}
    ngOnInit(): void {}
    getTimestamp(): void {}
}
