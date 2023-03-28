import { Component, OnInit } from '@angular/core';
import { GameDatabaseService } from '@app/services/game-database.service';

@Component({
    selector: 'app-gaming-history',
    templateUrl: './gaming-history.component.html',
    styleUrls: ['./gaming-history.component.scss'],
})
export class GamingHistoryComponent implements OnInit {
    constructor(private readonly gameDatabaseService: GameDatabaseService) {}

    ngOnInit(): void {
        this.gameDatabaseService.getAllGames();
    }
    eraseGamingHistory() {
        throw new Error('Method not implemented.');
    }
}
