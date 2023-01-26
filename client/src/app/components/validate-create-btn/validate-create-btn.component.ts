import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-validate-create-btn',
    templateUrl: './validate-create-btn.component.html',
    styleUrls: ['./validate-create-btn.component.scss'],
})
export class ValidateCreateBtnComponent implements OnInit {
    @Input() text!: string;
    @Input() color!: string;
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output() onBtnClick = new EventEmitter();

    constructor() {}

    ngOnInit(): void {}

    onClick() {
        this.onBtnClick.emit();
    }
}
