import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-card-displayer',
    templateUrl: './card-displayer.component.html',
    styleUrls: ['./card-displayer.component.scss'],
})
export class CardDisplayerComponent implements OnInit {
    cards: number[] = [1, 2, 3, 4, 5, 6, 7];
    constructor() {}

    ngOnInit(): void {}
}
