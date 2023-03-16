import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { MouseButton } from '@app/components/play-area/play-area.component';
import * as constants from '@app/configuration/const-canvas';
import * as constantsTime from '@app/configuration/const-time';
import { Vec2 } from '@app/interfaces/vec2';
import { ClientTimeService } from '@app/services/client-time.service';
import { DrawService } from '@app/services/draw.service';
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

    mousePosition: Vec2;
    errorPenalty: boolean;
    unfoundedDifference: Set<number>[];
    diffFoundedSubscription: Subscription = new Subscription();
    playerFoundDiffSubscription: Subscription = new Subscription();
    gameStateSubscription: Subscription = new Subscription();
    // list of all the subscritions to be unsubscribed on destruction

    // TODO: reduce the number of parameters
    // eslint-disable-next-line max-params
    constructor(
        private readonly drawService: DrawService,
        public gameService: GameService,
        readonly socket: SocketClientService,
        readonly clientTimeService: ClientTimeService,
        public dialog: MatDialog,
        public route: ActivatedRoute,
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

    ngOnDestroy(): void {
        this.diffFoundedSubscription.unsubscribe();
        this.playerFoundDiffSubscription.unsubscribe();
        this.gameStateSubscription.unsubscribe();
        this.gameService.reinitializeGame();
        this.socket.disconnect();
        this.socket.leaveRoom();
    }

    ngAfterViewInit(): void {
        if (this.gameService.gameType === 'solo') {
            this.socket.connect();
            this.socket.joinRoomSolo(this.gameService.playerName);
        } else {
            const roomName = this.gameService.gameId + this.gameService.gameName;
            this.socket.sendRoomName(roomName);
        }
        this.gameService.displayIcons();
        this.drawService.setColor = 'yellow';
        this.diffFoundedSubscription = this.socket.diffFounded$.subscribe((newValue) => {
            if (newValue !== undefined) {
                this.drawService.setColor = 'black';
                this.drawDifference(newValue);
                this.drawService.setColor = 'yellow';
            }
        });

        this.gameStateSubscription = this.socket.gameState$.subscribe((newValue) => {
            const opponentName: string = this.gameService.opponentName;
            const msg: string = 'Vous avez perdu la partie, le vainqueur est : ' + opponentName;
            if (newValue === true && this.socket.statusPlayer !== this.gameService.playerName) {
                this.gameService.displayGameEnded(msg, 'finished');
                // this.socket.gameEnded(this.socket.getRoomName());
                this.socket.disconnect();
            }
        });

        this.playerFoundDiffSubscription = this.socket.playerFoundDiff$.subscribe((newValue) => {
            if (newValue === this.gameService.opponentName) {
                this.gameService.handlePlayerDifference();
            }
        });
    }

    getRouterParams() {
        this.gameService.playerName = this.route.snapshot.paramMap.get('player') as string;
        this.gameService.gameName = this.route.snapshot.paramMap.get('gameName') as string;
        this.gameService.gameType = this.route.snapshot.paramMap.get('gameType') as string;
        this.gameService.opponentName = this.route.snapshot.paramMap.get('opponentName') as string;
        this.gameService.gameId = this.route.snapshot.paramMap.get('gameId') as string;
    }

    ngOnInit(): void {
        this.getRouterParams();
        this.gameService.getGame(this.gameService.gameName);
        this.gameService.displayIcons();
        this.loading();
    }

    loading(): void {
        const timeout = 500;
        setTimeout(() => {
            this.unfoundedDifference = this.getSetDifference(this.gameService.game.listDifferences);
        }, timeout);
    }

    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left && !this.errorPenalty) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            const distMousePosition: number = this.mousePosition.x + this.mousePosition.y * this.width;
            const differ = this.unfoundedDifference.find((set) => set.has(distMousePosition));
            if (differ) {
                this.drawDifference(differ);
                // remove difference found from unfundedDifference
                this.unfoundedDifference = this.unfoundedDifference.filter((set) => set !== differ);
                console.log(this.socket.getRoomName());
                this.socket.sendDifference(differ, this.socket.getRoomName());
                this.displayWord('Trouvé');
                const dataToSend = {
                    message: this.gameService.playerName + ' a trouvé une différence',
                    playerName: this.gameService.playerName,
                    color: '#FF0000',
                    pos: '50%',
                    gameId: this.socket.getRoomName(),
                    event: true,
                };
                this.socket.sendMessage(dataToSend);
                this.socket.messageList.push({
                    message: this.gameService.playerName + ' a trouvé une différence',
                    userName: this.gameService.playerName,
                    mine: true,
                    color: '#FF0000',
                    pos: '50%',
                    event: true,
                });
                this.gameService.handleDifferenceFound();
            } else {
                this.errorPenalty = true;
                this.displayWord('Erreur');
                const dataToSend2 = {
                    message: this.gameService.playerName + ' a fait une erreur',
                    playerName: this.gameService.playerName,
                    color: '#FF0000',
                    pos: '50%',
                    gameId: this.socket.getRoomName(),
                    event: true,
                };
                this.socket.sendMessage(dataToSend2);
                this.socket.messageList.push({
                    message: dataToSend2.message,
                    userName: dataToSend2.playerName,
                    mine: true,
                    color: dataToSend2.color,
                    pos: dataToSend2.pos,
                    event: dataToSend2.event,
                });
            }
            this.clearCanvas();
        }
    }

    displayWord(word: string): void {
        this.drawService.drawWord(word, this.canvas1.nativeElement, this.mousePosition);
        this.drawService.drawWord(word, this.canvas2.nativeElement, this.mousePosition);
        if (word === 'Erreur') {
            this.gameService.playFailureAudio();
            setTimeout(() => {
                this.errorPenalty = false;
            }, constantsTime.BLINKING_TIME);
        } else {
            this.gameService.playSuccessAudio();
            this.blinkCanvas();
        }
    }

    getSetDifference(differencesStr: string[]): Set<number>[] {
        return differencesStr.map((a: string) => new Set(a.split(',').map((b: string) => Number(b))));
    }

    drawDifference(diff: Set<number>) {
        this.drawService.drawDiff(diff, this.canvas1.nativeElement);
        this.drawService.drawDiff(diff, this.canvas2.nativeElement);
    }

    blinkCanvas() {
        this.gameService.blinkDifference(this.canvas1, this.canvas2);
    }

    clearCanvas() {
        setTimeout(() => {
            this.drawService.clearDiff(this.canvas1.nativeElement);
            this.drawService.clearDiff(this.canvas2.nativeElement);
        }, constantsTime.BLINKING_TIME);
    }

    displayGiveUp(msg: string, type: string) {
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
}
