import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { MouseButton } from '@app/components/play-area/play-area.component';
import { Vec2 } from '@app/interfaces/vec2';
import { ClientTimeService } from '@app/services/client-time.service';
import { DrawService } from '@app/services/draw.service';
import { GameService } from '@app/services/game.service';
import { ImageDiffService } from '@app/services/image-diff.service';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, AfterViewInit {
    @ViewChild('canvas1', { static: true }) canvas1!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: true }) canvas2!: ElementRef<HTMLCanvasElement>;

    readonly DEFAULT_WIDTH = 640;
    readonly DEFAULT_HEIGHT = 480;
    mousePosition: Vec2 = { x: 0, y: 0 };
    roomName: string;

    constructor(
        private readonly drawService: DrawService,
        public gameService: GameService,
        readonly socket: SocketClientService,
        readonly clientTimeService: ClientTimeService,
        public dialog: MatDialog,
        private readonly imageDiffService: ImageDiffService,
    ) {}

    ngAfterViewInit(): void {
        // this.gameService.isplaying = true;
        this.socket.connect();
        this.socket.setRoomName(this.roomName);
        this.socket.sendRoomName(this.roomName);
        this.socket.joinRoom(this.gameService.playerName);
        this.clientTimeService.startTimer();
        this.socket.sendNbrHint(this.gameService.nHintsUnused);
    }

    ngOnInit(): void {
        this.roomName = this.gameService.generatePlayerRoomName();
        this.gameService.getGame('Game name 1');
        this.gameService.displayIcons();
    }

    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            const differenceDataSet: Set<number>[] = this.imageDiffService.defineDifferences();
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            const distMousePosition: number = this.mousePosition.x + this.mousePosition.y * this.DEFAULT_WIDTH;
            // Need real data and added '!' for testing purposes
            if (differenceDataSet.some((set) => set.has(distMousePosition))) {
                // this.clientTimeService.stopTimer();
                this.gameService.playSuccessAudio();
                this.gameService.blinkDifference(this.canvas1);
                this.drawService.drawWord('Trouvé', this.canvas1.nativeElement, this.mousePosition);
                this.drawService.drawWord('Trouvé', this.canvas2.nativeElement, this.mousePosition);
                this.gameService.clickDifferencesFound();
            } else {
                this.gameService.playFailureAudio();
                this.drawService.drawWord('Erreur', this.canvas1.nativeElement, this.mousePosition);
                this.drawService.drawWord('Erreur', this.canvas2.nativeElement, this.mousePosition);
            }
        }
    }

    async loadImage(): Promise<void> {
        await this.drawService.drawImageFromUrl(this.gameService.game.originalImageData, this.canvas1.nativeElement);
        await this.drawService.drawImageFromUrl(this.gameService.game.modifiedImageData, this.canvas2.nativeElement);
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
