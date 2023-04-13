import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameMessageEvent } from '@app/classes/game-records/message-event';
import { ShowDiffRecord } from '@app/classes/game-records/show-diff';
import { ShowNotADiffRecord } from '@app/classes/game-records/show-not-a-difference';
import { MessageAreaComponent } from '@app/components/message-area/message-area.component';
import * as constants from '@app/configuration/const-canvas';
import { Message } from '@app/interfaces/message';
import { HintsService } from '@app/services/hints/hints.service';
import { CheatModeService } from '@app/services/cheat-mode/cheat-mode.service';
import { DrawService } from '@app/services/draw/draw.service';
import { GameRecorderService } from '@app/services/game/game-recorder.service';
import { GameService } from '@app/services/game/game.service';
import { SocketClientService } from '@app/services/socket/socket-client.service';
import { Game } from '@common/game';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('originalImage', { static: true }) originalImage!: ElementRef<HTMLCanvasElement>;
    @ViewChild('modifiedImage', { static: true }) modifiedImage!: ElementRef<HTMLCanvasElement>;
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
    timeLimitStatusSubscription: Subscription = new Subscription();
    gameStateSubscription: Subscription = new Subscription();
    differenceSubscription: Subscription = new Subscription();
    teammateStatusSubscription: Subscription = new Subscription();
    notRewinding: boolean = true;
    // eslint-disable-next-line max-params
    constructor(
        public gameService: GameService,
        public socket: SocketClientService,
        public route: ActivatedRoute,
        private gameRecordService: GameRecorderService,
        public cheatModeService: CheatModeService,
        public hintsService: HintsService,
    ) {}

    get getCanvasImageModifier(): HTMLCanvasElement {
        return this.modifiedImage.nativeElement;
    }
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
        this.socket.imageLoaded$.subscribe((game: Game) => {
            this.loadImages(game);
        });
        if (!this.gameService.mode) this.socket.connect();
        this.gameService.setStartDate(new Date().toLocaleString());
        this.gameRecordService.page = this;
        this.getRouterParams();
        // this.gameService.handleDisconnect(); // doesn't work properly
        if (this.gameService.mode === 'tempsLimite') {
            this.gameService.getTimeLimitGame();
        } else {
            this.gameService.getClassicGame(this.gameService.gameName);
        }
        this.loading();
        this.cheatModeService.cheatModeKeyBinding();
        this.cheatModeService.canvas0 = this.canvasCheat0;
        this.cheatModeService.canvas1 = this.canvasCheat1;
        this.hintsService.hintsKeyBinding();
        this.hintsService.canvas0 = this.canvasCheat0;
        this.hintsService.canvas1 = this.canvasCheat1;
    }

    loading(): void {
        const timeout = 200;
        setTimeout(() => {
            this.loadImages();
            this.cheatModeService.unfoundedDifference = this.gameService.getSetDifference(this.gameService.game.listDifferences);
            this.hintsService.unfoundedDifference = this.gameService.getSetDifference(this.gameService.game.listDifferences);
        }, timeout);
    }

    loadImages(game: Game = this.gameService.game): void {
        if (game.originalImageData === undefined || game.modifiedImageData === undefined) return;
        DrawService.getImageDateFromDataUrl(game.originalImageData).subscribe((originalImageData) => {
            DrawService.drawImage(originalImageData, this.originalImage.nativeElement);
        });
        DrawService.getImageDateFromDataUrl(game.modifiedImageData).subscribe((modifiedImageData) => {
            DrawService.drawImage(modifiedImageData, this.modifiedImage.nativeElement);
        });
    }

    ngAfterViewInit(): void {
        const roomName = this.gameService.gameId + this.gameService.gameName;
        switch (this.gameService.gameType) {
            case 'solo':
                if (!this.gameService.mode) this.socket.joinRoomSolo(this.gameService.playerName, this.gameService.gameName);
                break;
            case 'double':
                // this.socket.sendGameName(this.gameService.gameName);
                this.socket.sendRoomName(roomName, this.gameService.mode);
                break;
            default:
                break;
        }
        this.subscriptions();
        this.gameRecordService.timeStart = Date.now();
    }

    startRewind(): void {
        if (this.notRewinding) this.initForRewind();
        this.cheatModeService.stopCheating();
        this.hintsService.stopHints();
        this.gameRecordService.startRewind();
    }

    initForRewind(): void {
        if (this.notRewinding) {
            this.cheatModeService.removeHotkeysEventListener();
            this.hintsService.removeHotkeysEventListener();
            this.diffFoundSubscription.unsubscribe();
            this.timeLimitStatusSubscription.unsubscribe();
            this.gameStateSubscription.unsubscribe();
            this.differenceSubscription.unsubscribe();
            this.teammateStatusSubscription.unsubscribe();
            this.socket.disconnect();
        }
        this.notRewinding = false;
        this.chat.isNotRewinding = false;
        this.clearCanvases();
        this.cheatModeService.resetService();
        this.hintsService.resetService();
        this.gameService.initRewind();
        this.cheatModeService.canvas0 = this.canvasCheat0;
        this.cheatModeService.canvas1 = this.canvasCheat1;
        this.hintsService.canvas0 = this.canvasCheat0;
        this.hintsService.canvas1 = this.canvasCheat1;
        this.cheatModeService.unfoundedDifference = this.gameService.getSetDifference(this.gameService.game.listDifferences);
        this.hintsService.unfoundedDifference = this.gameService.getSetDifference(this.gameService.game.listDifferences);
    }

    ngOnDestroy(): void {
        this.cheatModeService.removeHotkeysEventListener();
        this.hintsService.removeHotkeysEventListener();
        this.diffFoundSubscription.unsubscribe();
        this.timeLimitStatusSubscription.unsubscribe();
        this.gameStateSubscription.unsubscribe();
        this.differenceSubscription.unsubscribe();
        this.teammateStatusSubscription.unsubscribe();
        this.gameService.reinitializeGame();
        this.socket.disconnect();
        this.cheatModeService.resetService();
        this.hintsService.resetService();
        this.notRewinding = true;
        this.chat.isNotRewinding = true;
    }

    subscriptions(): void {
        this.subscribeToGameStatus();
        this.subscribeToTimeLimit();
        this.subscribeToDifference();
        // window.addEventListener('beforeunload', () => {
        //     if (this.gameService.gameType === 'double') {
        //         localStorage.setItem('reload', 'true'); // still not working properly
        //     }
        // });
    }

    subscribeToTimeLimit(): void {
        this.timeLimitStatusSubscription = this.socket.timeLimitStatus$.subscribe((newValue) => {
            if (newValue) {
                this.gameService.displayGameEnded('Félicitaion, vous avez gagné la partie ', 'finished');
            } else {
                this.gameService.displayGameEnded('Vous avez perdu la partie, meilleure chance la prochaine fois', 'finished');
            }
            this.socket.stopTimer(this.socket.getRoomName(), this.gameService.playerName);
            this.socket.gameEnded(this.socket.getRoomName());
            this.gameService.reinitializeGame();
            this.socket.disconnect();
        });

        this.teammateStatusSubscription = this.socket.teammateStatus$.subscribe((newValue) => {
            if (newValue) {
                this.gameService.gameType = 'solo';
            }
        });
    }

    subscribeToGameStatus(): void {
        this.gameStateSubscription = this.socket.gameState$.subscribe((newValue) => {
            const opponentName: string = this.gameService.opponentName;
            this.gameService.gameTime = this.currentTimer;
            const msg: string = 'Vous avez perdu la partie, le vainqueur est : ' + opponentName;
            if (newValue === true && this.socket.statusPlayer !== this.gameService.playerName) {
                this.gameService.displayGameEnded(msg, 'finished');
                this.socket.disconnect();
            }
        });
    }

    subscribeToDifference(): void {
        this.diffFoundSubscription = this.socket.diffFound$.subscribe((newValue) => {
            if (newValue) {
                new ShowDiffRecord(newValue, { canvas1: this.canvas1, canvas2: this.canvas2 }, false, this.gameService.mousePosition).record(
                    this.gameRecordService,
                );
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
                if (this.gameService.mode === 'tempsLimite') {
                    this.gameService.game = this.socket.getGame();
                    this.cheatModeService.unfoundedDifference = this.gameService.getSetDifference(this.gameService.game.listDifferences);
                }
            } else {
                new ShowNotADiffRecord(canvases, this.gameService.mousePosition).record(this.gameRecordService);
                new GameMessageEvent(this.gameService.sendErrorMessage()).record(this.gameRecordService);
            }
        });
    }

    getRouterParams(): void {
        this.gameService.playerName = this.route.snapshot.paramMap.get('player') as string;
        this.gameService.gameName = this.route.snapshot.paramMap.get('gameName') as string;
        this.gameService.gameType = this.route.snapshot.paramMap.get('gameType') as string;
        this.gameService.opponentName = this.route.snapshot.paramMap.get('opponentName') as string;
        this.gameService.gameId = this.route.snapshot.paramMap.get('gameId') as string;
        this.gameService.mode = this.route.snapshot.paramMap.get('mode') as string;
        if (this.gameService.mode === 'undefined') this.gameService.mode = '';
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
        this.loadImages();
    }
}
