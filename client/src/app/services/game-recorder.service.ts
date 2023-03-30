import { Injectable } from '@angular/core';
import { GameRecordCommand } from '@app/classes/game-record';
import { SEC_TO_MILLISEC, UNIT } from '@app/configuration/const-time';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { Subject } from 'rxjs';
import { GameService } from './game.service';
import { SocketClientService } from './socket-client.service';
@Injectable({
    providedIn: 'root',
})
export class GameRecorderService {
    gamePage: GamePageComponent;
    list: GameRecordCommand[] = [];
    tempList: GameRecordCommand[] = [];
    position = 0;
    action: GameRecordCommand | undefined;
    speed: number = 1;
    paused: boolean = false;
    myTimeout: ReturnType<typeof setTimeout> | undefined;
    progress$ = new Subject<number>();
    startingTime: number = 0;
    constructor(private gameService: GameService, private socketClient: SocketClientService) {
        this.socketClient.messageToAdd$.subscribe((message) => {
            this.do(message);
        });
    }

    get currentTime(): number {
        return this.socketClient.getRoomTime(this.socketClient.getRoomName());
    }

    get currentTimeInMilliseconds(): number {
        return this.currentTime * SEC_TO_MILLISEC;
    }

    get maxTime(): number {
        return this.gameService.gameTime;
    }

    set timeStart(time: number) {
        this.startingTime = time;
    }

    // this will be used to set the speed of the rewind
    // the default speed is 1 second per second
    // the speed can be set to 2, 3, 4, 5, 6, 7, 8, 9, 10
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
        this.gamePage = gamePage;
        this.gamePage.initForRewind();
        if (this.list.length === 0) {
            alert('No actions to rewind');
            return;
        }
        // prepare the game for the rewind
        this.position = 0;
        this.action = this.list[this.position++];
        this.lunchRewind();
    }

    lunchRewind() {
        clearInterval(this.myTimeout);
        this.myTimeout = setInterval(() => {
            if (this.position < this.list.length) {
                this.tick();
            } else {
                this.endRewind();
            }
        }, UNIT / this.speed);
    }

    stopRewind() {
        clearInterval(this.myTimeout);
    }

    // this will be used to tick the rewind
    // will be called every second
    private tick(): void {
        if (this.paused) return;

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        this.socketClient.gameTime = this.currentTime + UNIT / SEC_TO_MILLISEC;

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        this.progress$.next(Math.floor(this.currentTime) / this.maxTime);
        while (this.action) {
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            if (this.action.gameTime(this.startingTime) <= this.currentTimeInMilliseconds) {
                this.redo();
                this.action = this.list[this.position++];
            } else break;
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
        this.action.do(this.gamePage);
    }
    // this will be used to record the actions
    // that the user performs
    // the actions will be stored in a list
}
