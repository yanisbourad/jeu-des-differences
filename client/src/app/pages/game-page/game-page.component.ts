import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
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

    // TODO: use camelCase
    playerName: string;

    gameName: string;

    // TODO: reduce the number of parameters
    constructor (
        private readonly drawService: DrawService,
        public gameService: GameService,
        readonly socket: SocketClientService,
        readonly clientTimeService: ClientTimeService,
        public dialog: MatDialog,
        public routeur: Router,
        public route: ActivatedRoute,
    ) {
        this.mousePosition = { x: 0, y: 0 };
        this.errorPenalty = false;
    }

    get width(): number {
        return constants.defaultWidth;
    }

    get height(): number {
        return constants.defaultHeight;
    }

    ngOnDestroy(): void {
        this.clientTimeService.stopTimer();
        this.socket.disconnect();
        this.clientTimeService.resetTimer();
        this.socket.leaveRoom();
        this.gameName = '';
    }

    ngAfterViewInit(): void {
        this.socket.connect();
        this.socket.joinRoom(this.gameService.playerName);
        this.clientTimeService.startTimer();
        this.gameService.displayIcons();
        this.drawService.setColor = 'yellow';
    }

    getRouteurParams() {
        this.route.params.subscribe((params) => {
            this.gameName = params['gameName'];
            this.playerName = params['player'];
        });
    }

    ngOnInit(): void {
        this.getRouteurParams();
        this.gameService.getGame(this.gameName);
        this.gameService.displayIcons();
        this.loading();
        this.gameService.playerName = this.playerName;
    }

    loading(): void {
        setTimeout(() => {
            this.unfoundedDifference = this.getSetDifference(this.gameService.game.listDifferences);
        }, 500)
    }

    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left && !this.errorPenalty) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            const distMousePosition: number = this.mousePosition.x + this.mousePosition.y * this.width;
            const diff = this.unfoundedDifference.find((set) => set.has(distMousePosition));
            if (diff) {
                this.drawDifference(diff);
                // remove difference found from unfundedDifference
                this.unfoundedDifference = this.unfoundedDifference.filter((set) => set !== diff);
                this.displayWord('Trouvé');
            } else {
                this.errorPenalty = true;
                this.displayWord('Erreur');
            }
            this.clearCanvas();
        }
    }

    displayWord(word: string): void {
        if (word === 'Erreur') {
            this.gameService.playFailureAudio();
            this.drawService.drawWord(word, this.canvas1.nativeElement, this.mousePosition);
            this.drawService.drawWord(word, this.canvas2.nativeElement, this.mousePosition);
            setTimeout(() => {
                this.errorPenalty = false;
            }, constantsTime.BLINKING_TIME);
        } else {
            this.gameService.playSuccessAudio();
            this.drawService.drawWord(word, this.canvas1.nativeElement, this.mousePosition);
            this.drawService.drawWord(word, this.canvas2.nativeElement, this.mousePosition);
            this.gameService.clickDifferencesFound();
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
        // display modal
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
