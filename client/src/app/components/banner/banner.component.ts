import { Component } from '@angular/core';

@Component({
    selector: 'app-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss'],
})
export class BannerComponent {
    width: string = '1920px';
    height: string = '1080px';
    color: string = '';
    text: string = 'Classique';

    changeColor() {
        switch (this.text) {
            case 'Classique': {
                this.color = 'blue';

                break;
            }
            case 'Temps limité': {
                this.color = 'orange';

                break;
            }
            case 'Configuration': {
                this.color = 'purple';

                break;
            }
        }
    }
}
