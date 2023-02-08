import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// import { Router } from '@angular/router';
import { MouseButton } from '@app/components/play-area/play-area.component';
import { Vec2 } from '@app/interfaces/vec2';
import { ClientTimeService } from '@app/services/client-time.service';
import { DrawService } from '@app/services/draw.service';
import { GameService } from '@app/services/game.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { ImageDiffService } from '@app/services/image-diff.service';

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
        this.gameService.displayIcons();
    }

    ngOnInit(): void {
        this.roomName = this.gameService.generatePlayerRoomName();
    }

    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            const differenceDataSet: Set<number>[] = this.imageDiffService.defineDifferences();
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            const distMousePosition: number = this.mousePosition.x + this.mousePosition.y * this.DEFAULT_WIDTH;
            // Need real data
            if (differenceDataSet.some((set) => set.has(distMousePosition))) {
                // this.clientTimeService.stopTimer();
                this.gameService.playSuccessAudio();
                this.gameService.blinkDifference(this.canvas1);
                this.drawService.drawWords('Trouvé', this.canvas1.nativeElement, this.mousePosition);
                this.drawService.drawWords('Trouvé', this.canvas2.nativeElement, this.mousePosition);
                this.gameService.clickDifferencesFound();
            } else {
                this.gameService.playFailureAudio();
                this.drawService.drawWords('Erreur', this.canvas1.nativeElement, this.mousePosition);
                this.drawService.drawWords('Erreur', this.canvas2.nativeElement, this.mousePosition);
            }
        }
    }

    // async loadImage(): Promise<void> {
    //     const original_image = new Image();
    //     const modified_image = new Image();
    //     original_image.src = '../../../assets/img/k3FhRA.jpg';
    //     createImageBitmap(original_image).then((imageBitmap) => {
    //     this.drawService.drawImage(imageBitmap,this.canvas1.nativeElement);
    //     });
    //     modified_image.src = '../../../assets/img/k3FhRA.jpg';
    //     createImageBitmap(modified_image).then((imageBitmap) => {
    //     this.drawService.drawImage(imageBitmap,this.canvas2.nativeElement);
    //     });
    // }

    displayGiveUp(msg: string, type: string) {
        // display modal
        this.dialog.open(MessageDialogComponent, {
            data: [msg, type],
            minWidth: '250px',
            minHeight: '150px',
            panelClass: 'custom-dialog-container',
        });
    }

    displayGameEnded(msg: string, type: string, time: number) {
        // display modal
        this.dialog.open(MessageDialogComponent, {
            data: [msg, type, time],
            minWidth: '250px',
            minHeight: '250px',
            panelClass: 'custom-dialog-container',
        });
        // to put when number of difference found equal max difference
        // this.clientTimeService.stopTimer();
        // console.log(this.clientTimeService.getCount())
        // this.displayGameEnded("Félicitation, vous avez terminée la partie", "finished", this.clientTimeService.getCount());
    }

    giveUp(): void {
        this.displayGiveUp('Êtes-vous sûr de vouloir abandonner la partie? Cette action est irréversible.', 'giveUp');
    }
}
