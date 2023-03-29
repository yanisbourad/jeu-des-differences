import { Component, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as constants from '@app/configuration/const-time';
import { TimeConfig } from '@common/game';
import { GameDatabaseService } from '@app/services/game-database.service';

@Component({
    selector: 'app-time-popup',
    templateUrl: './time-popup.component.html',
    styleUrls: ['./time-popup.component.scss'],
})
export class TimePopupComponent {
    @Input() timer1: number = constants.TIMER_1_INIT;
    @Input() timer2: number = constants.TIMER_2_INIT;
    @Input() timer3: number = constants.TIMER_3_INIT;
    constant: TimeConfig;
    constructor(public dialogRef: MatDialogRef<TimePopupComponent>, readonly gameDatabaseService: GameDatabaseService) {}

    incrementTime1() {
        this.timer1 += constants.TIMER_INCREMENT;
    }
    decrementTime1() {
        this.timer1 -= constants.TIMER_INCREMENT;
    }
    incrementTime2() {
        this.timer2 += constants.TIMER_INCREMENT;
    }
    decrementTime2() {
        this.timer2 -= constants.TIMER_INCREMENT;
    }
    incrementTime3() {
        this.timer3 += constants.TIMER_INCREMENT;
    }
    decrementTime3() {
        this.timer3 -= constants.TIMER_INCREMENT;
    }
    onNoClick(): void {
        this.dialogRef.close();
    }

    onModify(): void {
        this.constant.timeInit = this.timer1;
        this.constant.timePen = this.timer2;
        this.constant.timeBonus = this.timer3;
        this.gameDatabaseService.updateConstants(this.constant).subscribe();
    }
}
