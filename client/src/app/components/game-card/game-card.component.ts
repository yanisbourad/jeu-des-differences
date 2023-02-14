import { Component, Directive, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NamePopupComponent } from '@app/components/name-popup/name-popup.component';
import { GameInfo } from '@common/game';

@Component({
    selector: 'app-game-card',
    templateUrl: './game-card.component.html',
    styleUrls: ['./game-card.component.scss'],
})
export class GameCardComponent implements OnInit {
    @Input() card!: GameInfo;
    name: string;
    gameName: string;
    typePage: 'Classique' | 'Configuration';
    url: string;

    constructor(public dialog: MatDialog, private router: Router) {}
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
}
@Directive({
    selector: '[appButtonOne]',
})
export class ButtonOneDirective {
    constructor() {}
}

@Directive({
    selector: '[appButtonTwo]',
})
export class ButtonTwoDirective {
    constructor() {}
}
@Directive({
    selector: '[appButtonThree]',
})
export class ButtonThreeDirective {
    constructor() {}
}
@Directive({
    selector: '[appButtonFour]',
})
export class ButtonFourDirective {
    constructor() {}
}
