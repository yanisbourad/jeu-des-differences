import { Component } from '@angular/core';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent {
    cards: unknown = [
        {
            title: 'jeu 1',
            image: 'image 1',
            difficulty: 8,
            solo: [{ name: 'yanis', time: '01:02' }],
        },
        {
            title: 'jeu 2',
            image: 'image 2',
            difficulty: 8,
            solo: [{ name: 'daniel', time: '01:03' }],
        },
        {
            title: 'jeu 3',
            image: 'image 3',
            difficulty: 8,
            solo: [{ name: 'lounes', time: '01:04' }],
        },
    ];
}
