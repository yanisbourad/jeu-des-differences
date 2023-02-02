import { Time } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { TimeService } from '@app/services/time.service';

@Component({
    selector: 'app-message-area',
    templateUrl: './message-area.component.html',
    styleUrls: ['./message-area.component.scss'],
})
export class MessageAreaComponent implements OnInit {
    @Input() time: Time;
    playerName: string = 'Daniel';
    playerInitials: string = this.playerName[0];
    eventMessageArray: string[] = new Array();
    test: number[] = new Array(25);
    constructor(private readonly timeService: TimeService) {}
    ngOnInit(): void {}
    getTimestamp(): number {
        return this.timeService.getCount();
    }
}
