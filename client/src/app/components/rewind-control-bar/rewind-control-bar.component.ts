import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GameRecorderService } from '@app/services/game-recorder.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-rewind-control-bar',
    templateUrl: './rewind-control-bar.component.html',
    styleUrls: ['./rewind-control-bar.component.scss'],
})
export class RewindControlBarComponent implements OnDestroy {
    // TODO: move to config file
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    speeds: number[] = [1, 2, 4];
    speed: number = 1;
    subs: Subscription;
    process: number = 0;

    constructor(public gameRecorderService: GameRecorderService, private router: Router) {
        this.subs = gameRecorderService.progress$.subscribe((process: number) => {
            this.process = Math.floor(process);
        });
    }
    ngOnDestroy(): void {
        this.subs.unsubscribe();
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
