import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { REWIND_SPEEDS } from '@app/configuration/const-time';
import { GameRecorderService } from '@app/services/game/game-recorder.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-rewind-control-bar',
    templateUrl: './rewind-control-bar.component.html',
    styleUrls: ['./rewind-control-bar.component.scss'],
})
export class RewindControlBarComponent implements OnDestroy {
    speeds: number[] = REWIND_SPEEDS;
    speed: number = 1;
    subs: Subscription;
    process: number = 0;

    constructor(public gameRecorderService: GameRecorderService, private router: Router) {
        this.subs = gameRecorderService.progress$.subscribe((process: number) => {
            this.process = process;
        });
        this.gameRecorderService.paused = false;
    }
    ngOnDestroy(): void {
        this.subs.unsubscribe();
        this.gameRecorderService.stopRewind();
    }

    updateSpeed(): void {
        this.gameRecorderService.rewindSpeed = this.speed;
    }
    restart() {
        this.gameRecorderService.startRewind();
    }
    togglePause() {
        this.gameRecorderService.togglePause();
    }
    redirect() {
        this.gameRecorderService.stopRewind();
        this.router.navigate(['/']);
    }
}
