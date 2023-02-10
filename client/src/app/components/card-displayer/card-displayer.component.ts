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

    constructor(private readonly gameDataBase: GameDatabaseService) {
        this.currentPage = 0;
    }
    ngOnInit(): void {
        this.getAllCards();
    }

    getAllCards() {
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
