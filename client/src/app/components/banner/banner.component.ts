import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-banner',
    templateUrl: './banner.component.html',
    styleUrls: ['./banner.component.scss'],
})
export class BannerComponent implements OnInit {
    width: string = '1920px';
    height: string = '1080px';
    color: 'rgb(39,86,156)' | 'rgb(187,96,31)' | 'rgb(99,60,141)';
    text: 'Classique' | 'Temps limité' | 'Configuration';
    url: string;
    constructor(private router: Router) {}

    ngOnInit(): void {
        this.url = this.router.url;
    }
    changeColor(): string {
        switch (this.url) {
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
