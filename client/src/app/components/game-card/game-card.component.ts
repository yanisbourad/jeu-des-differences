import { Component } from '@angular/core';
import { card } from '@app/interfaces/card';
@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent {
    cards: card[] = [
        {
            title: 'Mont Saint Michel',
            difficulty: 0,
            rankingSolo: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
            rankingMulti: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
            image: '../../../assets/imagePaysage.jpeg',
        },
        {
            title: 'Mont Saint Michel',
            difficulty: 0,
            rankingSolo: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
            rankingMulti: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
            image: '../../../assets/imagePaysage.jpeg',
        },
        {
            title: 'Mont Saint Michel',
            difficulty: 0,
            rankingSolo: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
            rankingMulti: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
            image: '../../../assets/imagePaysage.jpeg',
        },
        {
            title: 'Mont Saint Michel',
            difficulty: 0,
            rankingSolo: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
            rankingMulti: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
            image: '../../../assets/imagePaysage.jpeg',
        },
    ];
}
