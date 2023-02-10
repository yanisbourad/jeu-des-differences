import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameInfo } from '@common/game';
import { NamePopupComponent } from '@app/components/name-popup/name-popup.component';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent {
    @Input() card!: GameInfo;
    name: string;
    gameName: string;
    typePage: 'Classique' | 'Configuration';

    constructor(public dialog: MatDialog, private router: Router) {}
    openDialog(): void {
        const dialogRef = this.dialog.open(NamePopupComponent, {
            data: { name: this.name, gameName: this.card.gameName },
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.name = result;
        });
    }
    changeButton(): string {
        switch (this.router.url) {
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
}
