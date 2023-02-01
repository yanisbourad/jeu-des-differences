import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MouseButton } from '@app/components/play-area/play-area.component';
import { Vec2 } from '@app/interfaces/vec2';
import { DrawService } from '@app/services/draw.service';
import { GameService } from '@app/services/game.service';
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
    mousePosition: Vec2 = { x: 0, y: 0 };
    constructor(private readonly drawService: DrawService, public gameService: GameService) {}

    ngOnInit(): void {}
    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
            this.drawService.drawWords('trouvé', this.canvas1.nativeElement, this.mousePosition);
            this.drawService.drawWords('trouvé', this.canvas2.nativeElement, this.mousePosition);
        }
    }

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
