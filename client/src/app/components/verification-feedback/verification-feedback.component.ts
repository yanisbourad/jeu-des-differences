import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-verification-feedback',
    templateUrl: './verification-feedback.component.html',
    styleUrls: ['./verification-feedback.component.scss'],
})
export class VerificationFeedbackComponent {
    message: string;
    constructor(
        public dialogReff: MatDialogRef<VerificationFeedbackComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { message: string; confirmFunction: () => void },
    ) {
        this.message = data.message;
    }

    onClose() {
        this.message = '';
        this.dialogReff.close();
    }

    onConfirm(): void {
        this.data.confirmFunction();
        this.dialogReff.close();
    }
}
