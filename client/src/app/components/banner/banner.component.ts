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
    color: 'blue' | 'orange' | 'purple';
    text: 'Classique' | 'Temps limité' | 'Configuration';
    constructor(private router: Router) {}

    changeColor(): string {
        switch (this.router.url) {
            case '/classique': {
                this.text = 'Classique';
                this.color = 'blue';
                return 'blue';
            }
            case '/Tempslimite': {
                this.text = 'Temps limité';
                this.color = 'orange';
                return 'orange';
            }
            case '/config': {
                this.text = 'Configuration';
                this.color = 'purple';
                return 'purple';
            }
        }
        return 'white';
    }
}
