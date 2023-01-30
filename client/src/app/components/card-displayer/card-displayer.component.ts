import { Component, OnInit } from '@angular/core';
//import { card } from '@app/interfaces/card';
@Component({
    selector: 'app-card-displayer',
    templateUrl: './card-displayer.component.html',
    styleUrls: ['./card-displayer.component.scss'],
})
export class CardDisplayerComponent implements OnInit {
    cards: number[] = [1,2,3,4];
    constructor() {}

    ngOnInit(): void {}
}
