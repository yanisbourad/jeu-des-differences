import { Component, Input } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { TimePopupComponent } from '@app/components/time-popup/time-popup.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    @Input() iconUsed: boolean;
    readonly logo: string = 'https://cdn-icons-png.flaticon.com/512/8464/8464334.png';
    readonly title: string = 'VQ';
    constructor(public dialog: MatDialog) {}
    openSettings(): void {
        const dialogRef = this.dialog.open(TimePopupComponent, {
            height: '774px',
            width: '1107px',
        });
        dialogRef.afterClosed().subscribe(() => {});
    }
}
