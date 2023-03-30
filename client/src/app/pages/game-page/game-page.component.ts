import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { GameMessageEvent } from '@app/classes/game-records/message-event';
import { ShowDiffRecord } from '@app/classes/game-records/show-diff';
import { ShowNotADiffRecord } from '@app/classes/game-records/show-not-a-difference';
import { StartCheatModeRecord } from '@app/classes/game-records/start-cheat-mode';
import { StopCheatModeRecord } from '@app/classes/game-records/stop-cheat-mode';
import { MessageAreaComponent } from '@app/components/message-area/message-area.component';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { MouseButton } from '@app/components/play-area/play-area.component';
import * as constants from '@app/configuration/const-canvas';
import * as constantsTime from '@app/configuration/const-time';
import { Message } from '@app/interfaces/message';
import { Vec2 } from '@app/interfaces/vec2';
import { DrawService } from '@app/services/draw.service';
import { GameRecorderService } from '@app/services/game-recorder.service';
import { GameService } from '@app/services/game.service';
import { HotkeysService } from '@app/services/hotkeys.service';
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
    blinking: ReturnType<typeof setTimeout>;
    idEventList: number;
    mousePosition: Vec2;
    errorPenalty: boolean;
    unfoundedDifference: Set<number>[];
    isCheating: boolean = false;
    // list of all the subscriptions to be unsubscribed on destruction
    diffFoundSubscription: Subscription = new Subscription();
    playerFoundDiffSubscription: Subscription = new Subscription();
    gameStateSubscription: Subscription = new Subscription();
    notRewinding: boolean = true;

    // TODO: reduce the number of parameters + move some functions to service, the logic shouldn't be here!!
    // eslint-disable-next-line max-params
    constructor(
        private readonly drawService: DrawService,
        public gameService: GameService,
        readonly socket: SocketClientService,
        public dialog: MatDialog,
        public route: ActivatedRoute,
        readonly hotkeysService: HotkeysService,
        private gameRecordService: GameRecorderService,
    ) {
        this.mousePosition = { x: 0, y: 0 };
        this.errorPenalty = false;
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
        this.gameRecordService.page = this;
        this.getRouterParams();
        this.gameService.getGame(this.gameService.gameName);
        this.loading();
    }

    loading(): void {
        const timeout = 500;
        setTimeout(() => {
            this.unfoundedDifference = this.getSetDifference(this.gameService.game.listDifferences);
        }, timeout);
    }

    ngAfterViewInit(): void {
        this.socket.connect();
        if (this.gameService.gameType === 'solo') {
            this.socket.joinRoomSolo(this.gameService.playerName);
        } else {
            const roomName = this.gameService.gameId + this.gameService.gameName;
            this.socket.sendRoomName(roomName);
            this.idEventList = this.cheatModeKeyBinding();
        }
        this.subscriptions();
        this.gameRecordService.timeStart = Date.now();
    }

    startRewind(): void {
        this.initForRewind();
        this.gameRecordService.startRewind();
    }
    initForRewind(): void {
        this.notRewinding = false;
        this.chat.isNotRewinding = false;
        clearInterval(this.blinking);
        this.clearCanvas(this.canvas1.nativeElement, this.canvas2.nativeElement);
        this.clearCanvas(this.canvas3.nativeElement, this.canvas0.nativeElement);
        this.isCheating = false;
        this.diffFoundSubscription.unsubscribe();
        this.playerFoundDiffSubscription.unsubscribe();
        this.gameStateSubscription.unsubscribe();
        this.socket.disconnect();
        if (this.gameService.gameType === 'double') this.hotkeysService.removeHotkeysEventListener(this.idEventList);
        this.gameService.initRewind();
    }

    ngOnDestroy(): void {
        clearInterval(this.blinking);
        this.clearCanvas(this.canvas1.nativeElement, this.canvas2.nativeElement);
        if (this.gameService.gameType === 'double') this.hotkeysService.removeHotkeysEventListener(this.idEventList);
        this.diffFoundSubscription.unsubscribe();
        this.playerFoundDiffSubscription.unsubscribe();
        this.gameStateSubscription.unsubscribe();
        this.gameService.reinitializeGame();
        this.socket.disconnect();
    }

    subscriptions(): void {
        this.diffFoundSubscription = this.socket.diffFound$.subscribe((newValue) => {
            if (newValue) {
                new ShowDiffRecord(newValue).record(this.gameRecordService);
                this.unfoundedDifference = this.unfoundedDifference.filter((set) => !this.eqSet(set, newValue));
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

        // this.playerFoundDiffSubscription = this.socket.playerFoundDiff$.subscribe((newValue) => {
        //     if (newValue === this.gameService.opponentName) {
        //         // this.gameService.handlePlayerDifference();
        //         console.log('player found diff handled by ShowDiffRecord');
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
        if (event.button === MouseButton.Left && !this.errorPenalty && this.notRewinding) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            const distMousePosition: number = this.mousePosition.x + this.mousePosition.y * this.width;
            const diff = this.unfoundedDifference.find((set) => set.has(distMousePosition));
            if (diff) {
                new ShowDiffRecord(diff, this.mousePosition, true).record(this.gameRecordService);
                new GameMessageEvent(this.gameService.sendFoundMessage()).record(this.gameRecordService);
                this.gameService.handleDifferenceFound();
            } else {
                new ShowNotADiffRecord(this.mousePosition).record(this.gameRecordService);
                new GameMessageEvent(this.gameService.sendErrorMessage()).record(this.gameRecordService);
            }
        }
    }

    // called from the record service ShowDiffRecord
    showDifferenceFoundByMe(diff: Set<number>, mousePosition: Vec2): void {
        this.displayWord('Trouvé', mousePosition);
        this.drawDifference(diff, 'yellow');
        this.unfoundedDifference = this.unfoundedDifference.filter((set) => set !== diff);
        this.gameService.reduceNbrDifferences();
        this.socket.sendDifference(diff, this.socket.getRoomName());
        this.clearCanvas(this.canvas0.nativeElement, this.canvas3.nativeElement);
    }

    // called from the record service ShowNotADiffRecord
    showErrorNotADifference(mousePosition: Vec2): void {
        this.errorPenalty = true;
        this.displayWord('Erreur', mousePosition);
        this.clearCanvas(this.canvas0.nativeElement, this.canvas3.nativeElement);
    }

    displayWord(word: string, mousePosition: Vec2): void {
        this.drawService.drawWord(word, this.canvas0.nativeElement, mousePosition);
        this.drawService.drawWord(word, this.canvas3.nativeElement, mousePosition);
        if (word === 'Erreur') {
            this.gameService.playFailureAudio();
            setTimeout(() => {
                this.errorPenalty = false;
            }, constantsTime.BLINKING_TIME);
        } else {
            this.gameService.playSuccessAudio();
            this.gameService.blinkDifference(this.canvas1, this.canvas2);
        }
    }

    getSetDifference(differencesStr: string[]): Set<number>[] {
        return differencesStr.map((a: string) => new Set(a.split(',').map((b: string) => Number(b))));
    }

    drawDifference(diff: Set<number>, color: string = 'black', isCheating: boolean = false): void {
        const tempColor = this.drawService.getColor;
        this.drawService.setColor = color;
        if (!isCheating) {
            this.drawService.drawDiff(diff, this.canvas1.nativeElement);
            this.drawService.drawDiff(diff, this.canvas2.nativeElement);
        } else {
            this.drawService.drawDiff(diff, this.canvasCheat0.nativeElement);
            this.drawService.drawDiff(diff, this.canvasCheat1.nativeElement);
        }
        this.drawService.setColor = tempColor;
    }

    clearCanvas(canvasA: HTMLCanvasElement, canvasB: HTMLCanvasElement): void {
        setTimeout(() => {
            this.drawService.clearDiff(canvasA);
            this.drawService.clearDiff(canvasB);
        }, constantsTime.BLINKING_TIME);
    }
    clearCanvasCheat(canvasA: HTMLCanvasElement, canvasB: HTMLCanvasElement): void {
        this.drawService.clearDiff(canvasA);
        this.drawService.clearDiff(canvasB);
    }

    displayGiveUp(msg: string, type: string): void {
        this.dialog.open(MessageDialogComponent, {
            data: [msg, type],
            minWidth: '250px',
            minHeight: '150px',
            panelClass: 'custom-dialog-container',
        });
    }

    giveUp(): void {
        this.displayGiveUp('Êtes-vous sûr de vouloir abandonner la partie? Cette action est irréversible.', 'giveUp');
    }

    cheatMode(): void {
        let color = 'black';
        this.blinking = setInterval(() => {
            color = color === 'black' ? 'yellow' : 'black';
            for (const set of this.unfoundedDifference) {
                this.drawDifference(set, color, true);
            }
        }, constantsTime.BLINKING_TIMEOUT);
    }

    stopCheatMode(): void {
        clearInterval(this.blinking);
        this.clearCanvasCheat(this.canvasCheat0.nativeElement, this.canvasCheat1.nativeElement);
        this.drawService.setColor = 'black';
    }

    toggleCheating(): void {
        const chatBox = document.getElementById('chat-box');
        if (document.activeElement === chatBox) return;

        this.isCheating = !this.isCheating;
        if (this.isCheating) new StartCheatModeRecord().record(this.gameRecordService);
        else new StopCheatModeRecord().record(this.gameRecordService);
    }

    cheatModeKeyBinding(): number {
        return this.hotkeysService.hotkeysEventListener(['t'], true, this.toggleCheating.bind(this));
    }

    eqSet(set1: Set<number>, set2: Set<number>): boolean {
        return (
            set1.size === set2.size &&
            [...set1].every((x) => {
                return set2.has(x);
            })
        );
    }

    showMessage(message: Message): void {
        this.chat.pushMessage(message);
    }
}
