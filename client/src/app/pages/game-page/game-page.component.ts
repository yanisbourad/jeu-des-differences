import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameMessageEvent } from '@app/classes/game-records/message-event';
import { ShowDiffRecord } from '@app/classes/game-records/show-diff';
import { ShowNotADiffRecord } from '@app/classes/game-records/show-not-a-difference';
import { MessageAreaComponent } from '@app/components/message-area/message-area.component';
import * as constants from '@app/configuration/const-canvas';
import { Message } from '@app/interfaces/message';
import { CheatModeService } from '@app/services/cheat-mode.service';
import { DrawService } from '@app/services/draw.service';
import { GameRecorderService } from '@app/services/game-recorder.service';
import { GameService } from '@app/services/game.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('canvas1', { static: true }) canvas1!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: true }) canvas2!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas0', { static: true }) canvas0!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas3', { static: true }) canvas3!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvasCheat0', { static: true }) canvasCheat0!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvasCheat1', { static: true }) canvasCheat1!: ElementRef<HTMLCanvasElement>;
    // a reference to the chatComponent

    @ViewChild('chatComponent', { static: true }) chat!: MessageAreaComponent;
    idEventList: number;
    // list of all the subscriptions to be unsubscribed on destruction
    diffFoundSubscription: Subscription = new Subscription();
    playerFoundDiffSubscription: Subscription = new Subscription();
    gameStateSubscription: Subscription = new Subscription();
    notRewinding: boolean = true;
    differenceSubscription: Subscription = new Subscription();
    // eslint-disable-next-line max-params
    constructor(
        public gameService: GameService,
        readonly socket: SocketClientService,
        public route: ActivatedRoute,
        private gameRecordService: GameRecorderService,
        public cheatModeService: CheatModeService,
    ) {}

    get width(): number {
        return constants.DEFAULT_WIDTH;
    }

    get height(): number {
        return constants.DEFAULT_HEIGHT;
    }

    get gameTime(): number {
        return this.gameService.gameTime;
    }

    get currentTimer(): number {
        return this.socket.getRoomTime(this.socket.roomName);
    }

    ngOnInit(): void {
        // needed for the rewind
        this.gameRecordService.page = this;
        this.getRouterParams();
        this.gameService.getGame(this.gameService.gameName);
        this.loading();
        this.socket.sendGameName(this.gameService.gameName);
        if (this.gameService.gameType !== 'solo') {
            this.cheatModeService.cheatModeKeyBinding();
            this.cheatModeService.canvas0 = this.canvasCheat0;
            this.cheatModeService.canvas1 = this.canvasCheat1;
        }
    }

    loading(): void {
        const timeout = 500;
        setTimeout(() => {
            this.cheatModeService.unfoundedDifference = this.gameService.getSetDifference(this.gameService.game.listDifferences);
        }, timeout);
    }

    ngAfterViewInit(): void {
        this.socket.connect();
        if (this.gameService.gameType === 'solo') {
            this.socket.joinRoomSolo(this.gameService.playerName);
        } else {
            const roomName = this.gameService.gameId + this.gameService.gameName;
            this.socket.sendRoomName(roomName);
        }
        this.subscriptions();
        this.gameRecordService.timeStart = Date.now();
    }

    startRewind(): void {
        if (this.notRewinding) this.initForRewind();
        this.cheatModeService.stopCheating();
        this.gameRecordService.startRewind();
    }

    initForRewind(): void {
        if (this.notRewinding) {
            this.cheatModeService.removeHotkeysEventListener();
            this.diffFoundSubscription.unsubscribe();
            this.playerFoundDiffSubscription.unsubscribe();
            this.gameStateSubscription.unsubscribe();
            this.socket.disconnect();
        }
        this.notRewinding = false;
        this.chat.isNotRewinding = false;
        this.clearCanvases();
        this.cheatModeService.resetService();
        this.gameService.initRewind();
        this.cheatModeService.canvas0 = this.canvasCheat0;
        this.cheatModeService.canvas1 = this.canvasCheat1;
        this.cheatModeService.unfoundedDifference = this.gameService.getSetDifference(this.gameService.game.listDifferences);
    }

    ngOnDestroy(): void {
        this.cheatModeService.removeHotkeysEventListener();
        this.diffFoundSubscription.unsubscribe();
        this.playerFoundDiffSubscription.unsubscribe();
        this.gameStateSubscription.unsubscribe();
        this.differenceSubscription.unsubscribe();
        this.gameService.reinitializeGame();
        this.socket.disconnect();
        this.cheatModeService.resetService();
        this.notRewinding = true;
        this.chat.isNotRewinding = true;
    }

    subscriptions(): void {
        this.diffFoundSubscription = this.socket.diffFound$.subscribe((newValue) => {
            if (newValue) {
                new ShowDiffRecord(newValue, { canvas1: this.canvas1, canvas2: this.canvas2 }, false, this.gameService.mousePosition).record(
                    this.gameRecordService,
                );
            }
        });

        this.gameStateSubscription = this.socket.gameState$.subscribe((newValue) => {
            const opponentName: string = this.gameService.opponentName;
            this.gameService.gameTime = this.currentTimer;
            const msg: string = 'Vous avez perdu la partie, le vainqueur est : ' + opponentName;
            if (newValue === true && this.socket.statusPlayer !== this.gameService.playerName) {
                this.gameService.displayGameEnded(msg, 'finished');
                this.socket.disconnect();
            }
        });

        this.differenceSubscription = this.socket.difference$.subscribe((newValue) => {
            const canvases = {
                canvas1: this.canvas1,
                canvas2: this.canvas2,
                canvas0: this.canvas0,
                canvas3: this.canvas3,
            };
            if (newValue) {
                new ShowDiffRecord(newValue, canvases, true, this.gameService.mousePosition).record(this.gameRecordService);
                new GameMessageEvent(this.gameService.sendFoundMessage()).record(this.gameRecordService);
                this.gameService.handleDifferenceFound();
                this.socket.sendDifference(newValue, this.socket.getRoomName());
            } else {
                new ShowNotADiffRecord(canvases, this.gameService.mousePosition).record(this.gameRecordService);
                new GameMessageEvent(this.gameService.sendErrorMessage()).record(this.gameRecordService);
            }
        });

        // this.playerFoundDiffSubscription = this.socket.playerFoundDiff$.subscribe((newValue) => {
        //     if (newValue === this.gameService.opponentName) {
        //         this.gameService.handlePlayerDifference();
        //     }
        // });
    }

    getRouterParams(): void {
        this.gameService.playerName = this.route.snapshot.paramMap.get('player') as string;
        this.gameService.gameName = this.route.snapshot.paramMap.get('gameName') as string;
        this.gameService.gameType = this.route.snapshot.paramMap.get('gameType') as string;
        this.gameService.opponentName = this.route.snapshot.paramMap.get('opponentName') as string;
        this.gameService.gameId = this.route.snapshot.paramMap.get('gameId') as string;
    }

    mouseHitDetect(event: MouseEvent): void {
        this.gameService.mouseHitDetect(event);
    }

    showMessage(message: Message): void {
        this.chat.pushMessage(message);
    }

    clearCanvases(): void {
        DrawService.clearDiff(this.canvas0.nativeElement);
        DrawService.clearDiff(this.canvas2.nativeElement);
        DrawService.clearDiff(this.canvas3.nativeElement);
        DrawService.clearDiff(this.canvasCheat0.nativeElement);
        DrawService.clearDiff(this.canvas1.nativeElement);
        DrawService.clearDiff(this.canvasCheat1.nativeElement);
    }
}
