import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NamePopupComponent } from '@app/components/name-popup/name-popup.component';
import { GameCardHandlerServiceService } from '@app/services/game-card-handler-service.service';
import { GameInfo } from '@common/game';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit {
    @Input() card!: GameInfo;
    createJoinState: string = 'Créer';
    name: string;
    gameName: string;
    typePage: 'Classique' | 'Configuration';
    url: string;

    constructor(public dialog: MatDialog, private router: Router, private readonly gameCardHandlerServiceService: GameCardHandlerServiceService) {}
    openDialog(): void {
        const dialogRef = this.dialog.open(NamePopupComponent, {
            data: { name: this.name, gameName: this.card.gameName, gameType: 'solo' },
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.name = result;
        });
    }

    ngOnInit(): void {
        this.url = this.router.url;
    }

    launchDialog(): void {
        const dialogRef = this.dialog.open(NamePopupComponent, {
            data: { name: this.name, gameName: this.card.gameName, gameType: 'double' },
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.name = result;
        });
    }

    changeButton(): string {
        switch (this.url) {
            case '/classique': {
                this.typePage = 'Classique';
                this.createJoinState = this.gameCardHandlerServiceService.toggleCreateJoin(this.card.gameName);
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
