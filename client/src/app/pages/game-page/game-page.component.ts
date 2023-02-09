import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { MouseButton } from '@app/components/play-area/play-area.component';
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

    readonly DEFAULT_WIDTH = 640;
    readonly DEFAULT_HEIGHT = 480;
    mousePosition: Vec2 = { x: 0, y: 0 };
    roomName: string;
    errorPenalty: boolean = false;
    unfoundedDifference: Set<number>[];
    playername: string;
    gameName: string;

    constructor(
        private readonly drawService: DrawService,
        public gameService: GameService,
        readonly socket: SocketClientService,
        readonly clientTimeService: ClientTimeService,
        public dialog: MatDialog,
        public routeur: Router,
        public route : ActivatedRoute,
    ) {}
    ngOnDestroy(): void {
        this.clientTimeService.stopTimer();
        this.socket.disconnect();
        this.clientTimeService.resetTimer();
    }

    ngAfterViewInit(): void {
        this.socket.connect();
        this.socket.setRoomName(this.roomName);
        this.socket.sendRoomName(this.roomName);
        this.socket.joinRoom(this.gameService.playerName); // to validate tomorow!! same problem with timer sometimes start with the last game time
        this.clientTimeService.startTimer();
        this.socket.sendNbrHint(this.gameService.nHintsUnused);
        this.gameService.displayIcons();
        this.unfoundedDifference = this.getSetDifference(this.gameService.game.listDifferences);
        this.drawService.setColor = 'yellow';
    }
    
    getRouteurParams(){
        this.route.params.subscribe(params => {
            this.gameName =params['gameName'];
            this.playername = params['player'];
        });
    }

  
    ngOnInit(): void {
        this.roomName = this.gameService.generatePlayerRoomName();
        this.gameService.displayIcons();
        this.getRouteurParams();
        this.gameService.getGame(this.gameName);
        this.gameService.playerName = this.playername;
    }

    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left && !this.errorPenalty) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            const distMousePosition: number = this.mousePosition.x + this.mousePosition.y * this.DEFAULT_WIDTH;
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
            }, 1000);
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
        }, 1000);
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
