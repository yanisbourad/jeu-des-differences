import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

export interface DialogData {
    name: string;
}
@Component({
    selector: 'app-name-popup',
    templateUrl: './name-popup.component.html',
    styleUrls: ['./name-popup.component.scss'],
})
export class NamePopupComponent implements OnInit {
    constructor(
        public dialogRef: MatDialogRef<NamePopupComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { name: string; gameName: string; gameType: string },
        private route: Router,
    ) {}
    ngOnInit(): void {
        this.data.name = ' ';
    }
    onNoClick(): void {
        this.dialogRef.close();
    }
    redirect(): void {
        if (this.data.gameType === 'solo') this.route.navigate(['/game', { player: this.data.name, gameName: this.data.gameName }]);
    }
}
