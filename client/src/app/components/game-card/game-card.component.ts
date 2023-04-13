import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NamePopupComponent } from '@app/components/name-popup/name-popup.component';
import { GameCardHandlerService } from '@app/services/game/game-card-handler-service.service';
import { GameService } from '@app/services/game/game.service';
import { GameInfo, Rankings } from '@common/game';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit {
    @Input() card!: GameInfo;
    @Output() gameDeleted = new EventEmitter<void>();
    createJoinState: string = 'Créer';
    name: string;
    gameName: string;
    typePage: 'Classique' | 'Configuration';
    url: string;

    // eslint-disable-next-line max-params
    constructor(
        readonly gameService: GameService,
        public dialog: MatDialog,
        private router: Router,
        private readonly gameCardHandlerService: GameCardHandlerService,
    ) {}
    openDialog(): void {
        const dialogRef = this.dialog.open(NamePopupComponent, {
            data: { name: this.name, gameName: this.card.gameName, gameType: 'solo' },
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.name = result;
        });
    }

    ngOnInit(): void {
        this.url = this.router.url;
        this.gameService.rankingSoloCopy = this.card.rankingSolo;
        this.gameService.rankingMultiCopy = this.card.rankingMulti;
    }

    launchDialog(): void {
        const dialogRef = this.dialog.open(NamePopupComponent, {
            data: { name: this.name, gameName: this.card.gameName, gameType: 'double' },
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.name = result;
        });
    }

    changeButton(): string {
        switch (this.url) {
            case '/classique': {
                this.typePage = 'Classique';
                this.createJoinState = this.gameCardHandlerService.toggleCreateJoin(this.card.gameName);
                return this.typePage;
            }
            case '/config': {
                this.typePage = 'Configuration';
                return this.typePage;
            }
        }
        return '';
    }

    async onDelete(gameName: string) {
        try {
            await firstValueFrom(this.gameService.deleteGame(gameName));
            this.gameDeleted.emit();
        } catch (error) {
            alert('la suppression du jeu a échoué');
        }
    }
    async onReinitialise(gameName: string) {
        this.gameService.deleteOneGameRecords(gameName).subscribe((newRankings: Rankings) => {
            this.card.rankingMulti = newRankings.rankingMulti;
            this.card.rankingSolo = newRankings.rankingSolo;
        });
        // should update the view to reflect initial game records
    }
}
