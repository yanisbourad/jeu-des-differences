import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NamePopupComponent } from '@app/components/name-popup/name-popup.component';
import { GameInfo } from '@common/game';
import { GameService } from '@app/services/game.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit {
    @Input() card!: GameInfo;
    @Output() gameDeleted = new EventEmitter<void>();
    name: string;
    gameName: string;
    typePage: 'Classique' | 'Configuration';
    url: string;

    constructor(public dialog: MatDialog, private router: Router, readonly gameService: GameService) {}
    openDialog(): void {
        const dialogRef = this.dialog.open(NamePopupComponent, {
            data: { name: this.name, gameName: this.card.gameName },
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.name = result;
        });
    }
    ngOnInit(): void {
        this.url = this.router.url;
    }
    changeButton(): string {
        switch (this.url) {
            case '/classique': {
                this.typePage = 'Classique';
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
            console.error(error);
        }
    }
}
