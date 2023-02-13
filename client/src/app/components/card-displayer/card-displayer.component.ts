import { Component, OnInit } from '@angular/core';
import * as constants from '@app/configuration/const-game';
import { GameDatabaseService } from '@app/services/game-database.service';
import { GameInfo } from '@common/game';

@Component({
    selector: 'app-card-displayer',
    templateUrl: './card-displayer.component.html',
    styleUrls: ['./card-displayer.component.scss'],
})
export class CardDisplayerComponent implements OnInit {
    currentPage: number;
    allPages: number;
    cardByPage: number = constants.FOUR;
    allCards: GameInfo[];

    constructor(private readonly gameDataBase: GameDatabaseService) {
        this.currentPage = constants.ZERO;
    }
    ngOnInit(): void {
        this.updateCards();
    }

    updateCards() {
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
        const isFirstPage = this.currentPage === constants.ZERO;
        const newIndex = isFirstPage ? this.currentPage : this.currentPage - 1;
        this.currentPage = newIndex;
    }

    getCurrentPageCards(): GameInfo[] {
        const startIndex: number = this.cardByPage * this.currentPage;
        const endIndex: number = startIndex + this.cardByPage;
        const pageSliced: GameInfo[] = this.allCards.slice(startIndex, endIndex);
        if (this.allCards.length % this.cardByPage === constants.ZERO) {
            this.allPages = this.allCards.length / this.cardByPage - constants.ONE;
        } else {
            this.allPages = Math.floor(this.allCards.length / this.cardByPage);
        }
        return pageSliced;
    }
}
