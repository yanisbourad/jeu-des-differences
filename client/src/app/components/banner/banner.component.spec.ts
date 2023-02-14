import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BannerComponent } from './banner.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('BannerComponent', () => {
    let component: BannerComponent;
    let fixture: ComponentFixture<BannerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [BannerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(BannerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should return rgb(39,86,156) for url /classique', () => {
        component.url = '/classique';
        const color = component.changeColor();
        expect(color).toEqual('rgb(39,86,156)');
    });

    it('should return rgb(187,96,31) for url /Tempslimite', () => {
        component.url = '/Tempslimite';
        const color = component.changeColor();
        expect(color).toEqual('rgb(187,96,31)');
    });

    it('should return rgb(99,60,141) for url /config', () => {
        component.url = '/config';
        const color = component.changeColor();
        expect(color).toEqual('rgb(99,60,141)');
    });
});
