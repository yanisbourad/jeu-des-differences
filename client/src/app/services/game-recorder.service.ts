import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameRecordCommand } from '@app/classes/game-record';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { GameService } from './game.service';

@Injectable({
    providedIn: 'root',
})
export class GameRecorderService {
    gamePage: GamePageComponent;
    list: GameRecordCommand[] = [];
    action: GameRecordCommand | undefined;
    speed: number = 1;
    constructor(private gameService: GameService, private router: Router) {}

    // this will be used to set the speed of the rewind
    // the default speed is 1 second per second
    // the speed can be set to 2, 3, 4, 5, 6, 7, 8, 9, 10
    // representing the multiplier of the speed
    // 2 means 2 seconds per second ...
    set rewindSpeed(speed: number) {
        this.speed = speed;
    }

    do(action: GameRecordCommand) {
        action.do(this.gamePage);
        this.list.push(action);
    }

    // this will be used to start the rewind
    // will take the controls of the game
    // need to make all the user interactions blocked during the rewind
    startRewind(gamePage: GamePageComponent) {
        this.gamePage = gamePage;

        if (this.list.length === 0) {
            alert('No actions to rewind');
            return;
        }
        // prepare the game for the rewind
        this.gameService.gameTime = 0;
        this.action = this.list.pop();

        // TODO: make this a constant
        const oneSecond = 1000;
        const myTimeout = setTimeout(() => {
            if (this.list.length > 0) {
                this.tick();
            } else {
                this.endRewind(myTimeout);
            }
        }, oneSecond / this.speed);
    }

    // this will be used to tick the rewind
    // will be called every second
    private tick(): void {
        this.gameService.gameTime += 1;
        if (this.gameService.gameTime === this.action?.gameTime) {
            this.redo();
            this.action = this.list.pop();
        }
    }

    // this will be used to end the rewind
    // will alert the user that the rewind is over
    // will redirect the user to the home page
    private endRewind(myTimeout: ReturnType<typeof setTimeout>) {
        clearTimeout(myTimeout);
        alert('the game has been rewired');
        this.router.navigate(['/home']);
    }

    private redo() {
        if (!this.action) return;
        this.action.do(this.gamePage);
    }

    // this will be used to record the actions
    // that the user performs
    // the actions will be stored in a list
}
