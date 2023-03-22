import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-give-up-message-popup',
    templateUrl: './give-up-message-popup.component.html',
    styleUrls: ['./give-up-message-popup.component.scss'],
})
export class GiveUpMessagePopupComponent {
    constructor(private router: Router, public dialog: MatDialog) {}

    redirect(): void {
        this.router.navigate(['/home']);
        this.dialog.closeAll();
    }
}
