import { Component } from '@angular/core';
// import { Router } from '@angular/router';
@Component({
    selector: 'app-card-displayer',
    templateUrl: './card-displayer.component.html',
    styleUrls: ['./card-displayer.component.scss'],
})
export class CardDisplayerComponent {
    cards: number[] = [1, 2, 3, 4];
    constructor() {}
}
