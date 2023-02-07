import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import { Router } from '@angular/router';
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
export class GamePageComponent implements OnInit {
    @ViewChild('canvas1', { static: true }) canvas1!: ElementRef<HTMLCanvasElement>;
    @ViewChild('canvas2', { static: true }) canvas2!: ElementRef<HTMLCanvasElement>;

    readonly DEFAULT_WIDTH = 640;
    readonly DEFAULT_HEIGHT = 480;
    readonly ONE_QUARTER = 1 / 4;
    readonly ONE_SIXTH = 1 / 6;
    mousePosition: Vec2 = { x: 0, y: 0 };
    playerNames : string[] = ["test7", "test2"] // get from database
   
    constructor(private readonly drawService: DrawService, public gameService: GameService, 
        readonly socket: SocketClientService, public readonly clientTimeService: ClientTimeService) {}

    ngOnInit(): void {
        this.socket.connect();
        this.socket.joinRoom(this.playerNames[0]);
        this.clientTimeService.startTimer();
    }

    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            // Testing mouse click arbitrary interval
            if (
                this.mousePosition.y <= this.DEFAULT_HEIGHT * (1 - this.ONE_QUARTER) &&
                this.mousePosition.y >= this.DEFAULT_HEIGHT * this.ONE_QUARTER &&
                this.mousePosition.x <= this.DEFAULT_WIDTH * (1 - this.ONE_SIXTH) &&
                this.mousePosition.x >= this.DEFAULT_WIDTH * this.ONE_SIXTH
            ) {
                this.clientTimeService.stopTimer();
                this.gameService.playSuccessAudio();
                this.drawService.drawWords('Trouvé', this.canvas1.nativeElement, this.mousePosition);
                this.drawService.drawWords('Trouvé', this.canvas2.nativeElement, this.mousePosition);
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
   
    giveUp(): void {
        /* feedback message : {Êtes-vous sur de vouloir abandonner la partie? Cette action est irréversible.}
        // if yes do
            // stop game
            // save infos???
            // redirect user to main page
        // else close modal and continue the game
        */
    }
}
