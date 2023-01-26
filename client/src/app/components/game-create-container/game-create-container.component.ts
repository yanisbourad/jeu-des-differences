import { Component, OnInit, ViewChild } from '@angular/core';
// import { BitmapService } from '@app/services/bitmap.service';

@Component({
    selector: 'app-game-create-container',
    templateUrl: './game-create-container.component.html',
    styleUrls: ['./game-create-container.component.scss'],
})
export class GameCreateContainerComponent implements OnInit {
    @ViewChild('CanvasNgxComponent', { static: false }) test: { printData: () => void };
    tic: boolean = false;

    // constructor(private readonly bitmapService: BitmapService) {}

    ngOnInit(): void {}

    processImages() {
        this.tic = !this.tic;
    }
}
