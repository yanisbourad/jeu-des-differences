import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss'],
})
export class BannerComponent {
    width: string = '1920px';
    height: string = '1080px';
    color: 'rgb(39,86,156)' | 'rgb(187,96,31)' | 'rgb(99,60,141)';
    text: 'Classique' | 'Temps limité' | 'Configuration';
    constructor(private router: Router) {}

    changeColor(): string {
        switch (this.router.url) {
            case '/classique': {
                this.text = 'Classique';
                this.color = 'rgb(39,86,156)';
                return 'rgb(39,86,156)';
            }
            case '/Tempslimite': {
                this.text = 'Temps limité';
                this.color = 'rgb(187,96,31)';
                return 'rgb(187,96,31)';
            }
            case '/config': {
                this.text = 'Configuration';
                this.color = 'rgb(99,60,141)';
                return 'rgb(99,60,141)';
            }
        }
        return 'white';
    }
}
