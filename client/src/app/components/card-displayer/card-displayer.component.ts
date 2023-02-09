import { Component, OnInit } from '@angular/core';
import { GameDatabaseService } from '@app/services/game-database.sercice';
import { GameInfo } from '@common/game';
// import { Router } from '@angular/router';
@Component({
    selector: 'app-card-displayer',
    templateUrl: './card-displayer.component.html',
    styleUrls: ['./card-displayer.component.scss'],
})
export class CardDisplayerComponent implements OnInit {
    currentPage: number; // page actuelle
    allPages: number;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    cardByPage: number = 4;
    allCards: GameInfo[];
    // allCards: card[] = [
    //     {
    //         title: 'Mont Saint Michel',
    //         difficulty: 0,
    //         rankingSolo: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
    //         rankingMulti: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
    //         image: '../../../assets/imagePaysage.jpeg',
    //     },
    //     {
    //         title: 'Mont Saint Michel',
    //         difficulty: 0,
    //         rankingSolo: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
    //         rankingMulti: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
    //         image: '../../../assets/imagePaysage.jpeg',
    //     },
    //     {
    //         title: 'Mont Saint Michel',
    //         difficulty: 0,
    //         rankingSolo: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
    //         rankingMulti: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
    //         image: '../../../assets/imagePaysage.jpeg',
    //     },
    //     {
    //         title: 'Mont Saint Michel',
    //         difficulty: 0,
    //         rankingSolo: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
    //         rankingMulti: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
    //         image: '../../../assets/imagePaysage.jpeg',
    //     },
    //     {
    //         title: 'Mont Saint Michel',
    //         difficulty: 0,
    //         rankingSolo: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
    //         rankingMulti: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
    //         image: '../../../assets/imagePaysage.jpeg',
    //     },
    //     {
    //         title: 'Mont Saint Michel',
    //         difficulty: 0,
    //         rankingSolo: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
    //         rankingMulti: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
    //         image: '../../../assets/imagePaysage.jpeg',
    //     },
    //     {
    //         title: 'Mont Saint Michel',
    //         difficulty: 0,
    //         rankingSolo: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
    //         rankingMulti: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
    //         image: '../../../assets/imagePaysage.jpeg',
    //     },
    // ]; // toutes les cartes

    constructor(private readonly gameDataBase: GameDatabaseService) {
        this.currentPage = 0;
    }
    ngOnInit(): void {
        this.getAllCards();
    }

    getAllCards(): void {
        this.gameDataBase.getAllGames().subscribe((res: GameInfo[]) => {
            this.allCards = res;
        });
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

    getCurrentPageCards(): GameInfo[] {
        console.log(this.allCards[0].rankingSolo[0]);
        const startIndex: number = this.cardByPage * this.currentPage;
        const endIndex: number = startIndex + this.cardByPage;
        const pageSliced: GameInfo[] = this.allCards.slice(startIndex, endIndex);
        if (this.allCards.length % this.cardByPage === 0) {
            this.allPages = this.allCards.length / this.cardByPage - 1;
        } else {
            this.allPages = Math.floor(this.allCards.length / this.cardByPage);
        }
        return pageSliced;
    }
}
