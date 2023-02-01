import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-message-area',
    templateUrl: './message-area.component.html',
    styleUrls: ['./message-area.component.scss'],
})
export class MessageAreaComponent implements OnInit {
    playerName: string = 'Daniel';
    eventMessageArray: string[] = new Array();

    constructor() {}
    ngOnInit(): void {}
}
