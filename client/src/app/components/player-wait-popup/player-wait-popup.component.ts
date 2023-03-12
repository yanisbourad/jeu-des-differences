import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-player-wait-popup',
    templateUrl: './player-wait-popup.component.html',
    styleUrls: ['./player-wait-popup.component.scss'],
})
export class PlayerWaitPopupComponent implements OnInit {
    constructor(
        public dialogRef: MatDialogRef<PlayerWaitPopupComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { name: string; gameName: string; gameType: string },
        private route: Router,
    ) {}
    ngOnInit(): void {
        this.data.name = ' ';
    }
    redirect() {
        if (this.data.gameType === 'double') this.route.navigate(['/game', { player: this.data.name, gameName: this.data.gameName }]);
    }
}
