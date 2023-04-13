import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NamePopupComponent } from '@app/components/name-popup/name-popup.component';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'VISUAL QUEST';
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    name: string;
    constructor(public dialog: MatDialog) {}

    openDialog(): void {
        const dialogRef = this.dialog.open(NamePopupComponent, {
            data: { name: this.name, isTimeLimit: true },
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.name = result;
        });
    }
}
