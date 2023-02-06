import { Component } from '@angular/core';
import { card } from '@app/interfaces/card';
// import { Router } from '@angular/router';
@Component({
    selector: 'app-card-displayer',
    templateUrl: './card-displayer.component.html',
    styleUrls: ['./card-displayer.component.scss'],
})
export class CardDisplayerComponent {
    currentPage: number; // page actuelle
    allPages: number;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    cardByPage: number = 4;
    allCards: card[] = [
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
    ]; // toutes les cartes
    constructor() {
        this.currentPage = 0;
    }

    goToNext(): void {
        const isLastPage = this.currentPage === this.allPages;
        const newIndex = isLastPage ? this.currentPage : this.currentPage + 1;
        this.currentPage = newIndex;
    }
    goToPrevious(): void {
        const isFirstPage = this.currentPage === 0;
        const newIndex = isFirstPage ? this.currentPage : this.currentPage - 1;
        this.currentPage = newIndex;
    }

    getCurrentPageCards(): card[] {
        const startIndex: number = this.cardByPage * this.currentPage;
        const endIndex: number = startIndex + this.cardByPage;
        const pageSliced: card[] = this.allCards.slice(startIndex, endIndex);
        if (this.allCards.length % this.cardByPage === 0) {
            this.allPages = this.allCards.length / this.cardByPage -1 ;
        } else {
            this.allPages = Math.floor(this.allCards.length / this.cardByPage);
        }
        return pageSliced;
    }
}
