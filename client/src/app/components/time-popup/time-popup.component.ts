import { Component, Input } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import * as constants from '@app/configuration/const-time';
import { TimeConfig } from '@common/game';
import { GameDatabaseService } from '@app/services/game-database.service';
import { VerificationFeedbackComponent } from '@app/components/verification-feedback/verification-feedback.component';

@Component({
    selector: 'app-time-popup',
    templateUrl: './time-popup.component.html',
    styleUrls: ['./time-popup.component.scss'],
})
export class TimePopupComponent {
    @Input() timer1: number = constants.INIT_TIME;
    @Input() timer2: number = constants.PENALTY_TIME;
    @Input() timer3: number = constants.BONUS_TIME;
    maxInitTime = constants.MAX_INIT_TIME;
    maxPenaltyTime = constants.MAX_PENALTY_TIME;
    maxBonusTime = constants.MAX_BONUS_TIME;
    message: string = 'êtes-vous sur de vouloir reinitialiser les constantes de jeu?';
    constructor(public dialogRef: MatDialogRef<TimePopupComponent>, readonly gameDatabaseService: GameDatabaseService, public dialog: MatDialog) {
        this.gameDatabaseService.getConstants().subscribe((res: TimeConfig) => {
            this.timer1 = res.timeInit;
            this.timer2 = res.timePen;
            this.timer3 = res.timeBonus;
        });
    }

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
        const newConstants: TimeConfig = {
            timeInit: this.timer1,
            timePen: this.timer2,
            timeBonus: this.timer3,
        };
        this.gameDatabaseService.updateConstants(newConstants).subscribe();
        this.onNoClick();
    }

    resetConstants(): void {
        const newConstants: TimeConfig = {
            timeInit: constants.INIT_TIME,
            timePen: constants.PENALTY_TIME,
            timeBonus: constants.BONUS_TIME,
        };
        this.gameDatabaseService.updateConstants(newConstants).subscribe();
    }

    launchFeedback(showedMessage: string): void {
        this.dialog
            .open(VerificationFeedbackComponent, {
                data: { message: showedMessage, confirmFunction: () => this.resetConstants() },
                disableClose: true,
            })
            .afterClosed()
            .subscribe(() => {
                this.onNoClick();
            });
    }
}
