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
        this.socket.disconnect();
        this.socket.leaveRoom();
    }

    ngAfterViewInit(): void {
        this.socket.connect();
        if (this.gameService.gameType === 'solo') {
            this.socket.joinRoomSolo(this.gameService.playerName);
        } else {
            const roomName = this.gameService.gameId + this.gameService.gameName;
            this.socket.sendRoomName(roomName);
        }
        this.gameService.displayIcons();
        this.drawService.setColor = 'yellow';
        this.socket.diffFounded$.subscribe((newValue) => {
            if (newValue !== undefined) {
                this.drawService.setColor = 'black';
                this.drawDifference(newValue);
                this.drawService.setColor = 'yellow';
            }
        });
        this.socket.gameState$.subscribe((newValue) => {
            if (newValue === true) {
                this.gameService.displayGameEnded('Vous avez perdu la partie', 'finished');
            }
        });

        this.socket.playerFoundDiff$.subscribe((newValue) => {
            if (newValue === this.gameService.opponentName) {
                this.gameService.handlePlayerDifference();
            }
        });
    }

    getRouterParams() {
        // this.playerName = this.route.snapshot.paramMap.get('player') as string;
        // this.gameName = this.route.snapshot.paramMap.get('gameName') as string;
        // this.gameType = this.route.snapshot.paramMap.get('gameType') as string;
        // this.opponentName = this.route.snapshot.paramMap.get('opponentName') as string;
        // this.gameId = this.route.snapshot.paramMap.get('gameId') as string;

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
            } else {
                this.errorPenalty = true;
                this.displayWord('Erreur');
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
