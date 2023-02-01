import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-card-displayer',
    templateUrl: './card-displayer.component.html',
    styleUrls: ['./card-displayer.component.scss'],
})
export class CardDisplayerComponent {
    // @Input() typePage: 'config' | 'selection';
    @Input() typePage: string;

    cards: number[] = [1, 2, 3, 4];
    constructor() {}
}
