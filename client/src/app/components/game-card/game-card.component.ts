import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { card } from '@app/interfaces/card';
import { NamePopupComponent } from '../name-popup/name-popup.component';
@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent {
    name: string;
    typePage: 'Classique' | 'Configuration';
    cards: card[] = [
        {
            title: 'Mont Saint Michel',
            difficulty: 0,
            rankingSolo: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
            rankingMulti: { name1: 'Ania', time1: 1.03, name2: 'Yanis', time2: 4.03, name3: 'Daniel', time3: 6.5 },
            image: '../../../assets/imagePaysage.jpeg',
        },
    ];
    constructor(public dialog: MatDialog, private router: Router) {}
    openDialog(): void {
        const dialogRef = this.dialog.open(NamePopupComponent, {
            data: { name: this.name },
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
