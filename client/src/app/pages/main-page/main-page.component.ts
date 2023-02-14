
import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'VISUAL QUEST';
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    constructor() {}

}
