import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-giveupmessage-popup',
    templateUrl: './giveupmessage-popup.component.html',
    styleUrls: ['./giveupmessage-popup.component.scss'],
})
export class GiveupmessagePopupComponent {
    constructor(private router: Router, public dialog: MatDialog) {}

    redirect(): void {
        this.router.navigate(['/home']);
        this.dialog.closeAll();
    }
}
