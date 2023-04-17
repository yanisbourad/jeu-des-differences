import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-general-feedback',
    templateUrl: './general-feedback.component.html',
    styleUrls: ['./general-feedback.component.scss'],
})
export class GeneralFeedbackComponent implements OnInit {
    message: string;
    constructor(public dialogReff: MatDialogRef<GeneralFeedbackComponent>, @Inject(MAT_DIALOG_DATA) public data: { message: string }) {
        this.message = data.message;
    }

    ngOnInit(): void {
        this.message = this.data.message;
    }

    onClose(): void {
        this.message = '';
        this.dialogReff.close();
    }
}
