import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TimePopupComponent } from '@app/components/time-popup/time-popup.component';
import { Router } from '@angular/router';
import { GameDatabaseService } from '@app/services/game-database.service';
// import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    @Input() iconUsed: boolean;
    newUrl: string;
    readonly logo: string = 'https://cdn-icons-png.flaticon.com/512/8464/8464334.png';
    readonly title: string = 'VQ';
    constructor(public dialog: MatDialog, public router: Router, readonly gameDatabaseService: GameDatabaseService) {}
    openSettings(): void {
        const dialogRef = this.dialog.open(TimePopupComponent, {
            height: '774px',
            width: '1107px',
        });
        dialogRef.afterClosed();
    }
    redirect(): boolean {
        this.newUrl = this.router.url.split(';')[0];
        return this.newUrl !== '/game';
    }

    resetGame(): void {
        this.gameDatabaseService.deleteAllGames();
    }
}
