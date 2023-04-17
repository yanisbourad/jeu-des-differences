import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as constants from '@app/configuration/const-game';
import { GameCardHandlerService } from '@app/services/game/game-card-handler-service.service';
import { GameDatabaseService } from '@app/services/game/game-database.service';
import { GameInfo } from '@common/game';

@Component({
    selector: 'app-card-displayer',
    templateUrl: './card-displayer.component.html',
    styleUrls: ['./card-displayer.component.scss'],
})
export class CardDisplayerComponent implements OnInit {
    currentPage: number;
    allPages: number;
    cardByPage: number = constants.GAMES_BY_PAGE;
    allCards: GameInfo[];
    isViewable: boolean;

    constructor(
        private readonly gameDataBase: GameDatabaseService,
        private changeDetectorRef: ChangeDetectorRef,
        private readonly gameCardHandlerService: GameCardHandlerService,
    ) {
        this.currentPage = 0;
    }
    ngOnInit(): void {
        this.isViewable = false;
        this.updateCards();
    }

    updateCards() {
        const gameNames: string[] = [];
        this.gameDataBase.getAllGames().subscribe((res: GameInfo[]) => {
            this.allCards = res;
            this.allCards.forEach((card: GameInfo) => {
                gameNames.push(card.gameName);
            });
            if (this.allCards) this.isViewable = true;
            this.gameCardHandlerService.updateGameStatus(gameNames);
            this.changeDetectorRef.detectChanges();
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
            this.allPages = this.allCards.length === 0 ? 0 : this.allCards.length / this.cardByPage - 1;
        } else {
            this.allPages = Math.floor(this.allCards.length / this.cardByPage);
        }
        return pageSliced;
    }

    onGameDeleted(game: GameInfo): void {
        this.allCards = this.allCards.filter((g) => g !== game);
        this.updateCards();
        this.getCurrentPageCards();
    }
}
