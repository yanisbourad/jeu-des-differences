import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule],
            declarations: [MainPageComponent],
            providers: [],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a game title', () => {
        expect(component.title).toEqual('VISUAL QUEST');
    });

    it('should have a button for classic mode', () => {
        const button = fixture.nativeElement;
        expect(button.querySelector('#classique').textContent).toContain('Mode Classique');
    });

    it('should have a button for limited time mode', () => {
        const button = fixture.nativeElement;
        expect(button.querySelector('button:nth-of-type(2)').textContent).toContain('Mode Temps limité');
    });

    it('should have a button for configuration', () => {
        const button = fixture.nativeElement;
        expect(button.querySelector('button:nth-of-type(3)').textContent).toContain('Configuration');
    });

    it('should have 6 authors', () => {
        const authors = fixture.nativeElement;
        expect(authors.querySelector('#authors').textContent).toContain(
            'Auteurs: Guimfack Melvice Junior, Hamza Berrada, Daniel Giao, Yanis Bouard, Lounes Sadmi, Renel Lherisson',
        );
    });

    it('should have a team number', () => {
        const team = fixture.nativeElement;
        expect(team.querySelector('#team').textContent).toContain('Équipe: 208');
    });
});
