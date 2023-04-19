import { Injectable } from '@angular/core';
import { GameRecordCommand } from '@app/classes/game-record';
import { DELAY_BEFORE_EMITTING_TIME, SEC_TO_MILLISEC, UNIT_DELAY_INTERVAL } from '@app/configuration/const-time';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { SocketClientService } from '@app/services/socket/socket-client.service';
import { Subject } from 'rxjs';
import { GameService } from './game.service';
@Injectable({
    providedIn: 'root',
})
export class GameRecorderService {
    gamePage: GamePageComponent;
    list: GameRecordCommand[] = [];
    serviceTime: number = 0;
    tempList: GameRecordCommand[] = [];
    position = 0;
    action: GameRecordCommand | undefined;
    speed: number = 1;
    paused: boolean = false;
    myTimeout: ReturnType<typeof setTimeout> | undefined;
    progress$ = new Subject<number>();
    startingTime: number = 0;
    sumPenalty: number = 0;

    constructor(private gameService: GameService, private socketClient: SocketClientService) {
        this.socketClient.messageToAdd$.subscribe((message) => {
            this.do(message);
        });
    }

    get isPaused(): boolean {
        return this.paused;
    }

    get currentTime(): number {
        return this.socketClient.getRoomTime(this.socketClient.getRoomName()) || 0;
    }

    get currentTimeInMillisecondsWithoutPenalty(): number {
        return (this.currentTime - this.sumPenalty) * SEC_TO_MILLISEC;
    }

    get maxTime(): number {
        return this.gameService.gameTime + DELAY_BEFORE_EMITTING_TIME / SEC_TO_MILLISEC;
    }

    get timeoutDelay(): number {
        return UNIT_DELAY_INTERVAL / this.speed;
    }

    set timeStart(time: number) {
        this.startingTime = time;
    }

    // this will be used to set the speed of the rewind
    // the default speed is 1 second per second
    // the speed can be set to 2, 3, 4
    // representing the multiplier of the speed
    // 2 means 2 seconds per second ...
    set rewindSpeed(speed: number) {
        this.speed = speed;
        if (this.myTimeout) {
            clearInterval(this.myTimeout);
            this.lunchRewind();
        }
    }

    set page(gamePage: GamePageComponent) {
        this.gamePage = gamePage;
        this.list = [];
        this.position = 0;
    }

    togglePause() {
        this.paused = !this.paused;
    }

    do(action: GameRecordCommand) {
        action.do(this.gamePage);
        this.list.push(action);
    }

    // this will be used to start the rewind
    // will take the controls of the game
    // need to make all the user interactions blocked during the rewind
    // will start the rewind from the beginning
    startRewind(gamePage: GamePageComponent = this.gamePage) {
        this.serviceTime = 0;
        this.gamePage = gamePage;
        this.gamePage.initForRewind();
        if (this.list.length === 0) {
            alert('No actions to rewind');
            return;
        }
        // prepare the game for the rewind
        this.socketClient.gameTime = 0;
        this.position = 0;
        this.action = this.list[this.position++];
        this.lunchRewind();
    }

    lunchRewind() {
        clearInterval(this.myTimeout);
        this.myTimeout = setInterval(() => {
            if (this.position <= this.list.length) {
                this.tick();
            } else {
                setTimeout(() => {
                    this.endRewind();
                }, DELAY_BEFORE_EMITTING_TIME);
            }
        }, this.timeoutDelay);
    }

    stopRewind() {
        clearInterval(this.myTimeout);
    }

    // this will be used to tick the rewind
    // will be called every second
    private tick(): void {
        if (this.paused) return;

        // set the view time to the current time
        this.socketClient.gameTime = this.currentTime + UNIT_DELAY_INTERVAL / SEC_TO_MILLISEC;

        // set the progress bar to the current time
        this.progress$.next(this.currentTime / this.maxTime);

        // while the current action is not null and its time is less than the current time
        while (this.action && this.action.gameTime(this.startingTime) <= this.currentTimeInMillisecondsWithoutPenalty) {
            this.redo();
            this.action = this.list[this.position++];
        }
    }

    // this will be used to end the rewind
    // will alert the user that the rewind is over
    // will redirect the user to the home page
    private endRewind() {
        clearInterval(this.myTimeout);

        this.paused = true;
        this.progress$.next(0);
        this.startRewind();
    }

    private redo() {
        if (!this.action) return;
        this.socketClient.gameTime = this.currentTime + this.action.penalty;
        this.sumPenalty += this.action.penalty;
        this.action.do(this.gamePage);
    }
    // this will be used to record the actions
    // that the user performs
    // the actions will be stored in a list
}
