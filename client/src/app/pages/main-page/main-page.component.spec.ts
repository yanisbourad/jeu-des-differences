import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CommunicationService } from '@app/services/communication.service';
import { of, throwError } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('ExampleService', ['basicGet', 'basicPost']);
        communicationServiceSpy.basicGet.and.returnValue(of({ title: '', body: '' }));
        communicationServiceSpy.basicPost.and.returnValue(of(new HttpResponse<string>({ status: 201, statusText: 'Created' })));

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule],
            declarations: [MainPageComponent],
            providers: [{ provide: CommunicationService, useValue: communicationServiceSpy }],
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
        expect(button.querySelector('button:nth-of-type(1)').textContent).toContain('Mode Classique');
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
        expect(authors.querySelector('#authors p').textContent).toContain(
            'Auteurs : Guimfack Melvice Junior, Hamza Berrada, Daniel Giao, Yanis Bouarad, Lounes Sadmi, Renel Lherisson',
        );
    });

    it('should have a team number', () => {
        const team = fixture.nativeElement;
        expect(team.querySelector('#team-number').textContent).toContain('Équipe : 208');
    });

    it('should call basicGet when calling getMessagesFromServer', () => {
        component.getMessagesFromServer();
        expect(communicationServiceSpy.basicGet).toHaveBeenCalled();
    });

    it('should call basicPost when calling sendTimeToServer', () => {
        component.sendTimeToServer();
        expect(communicationServiceSpy.basicPost).toHaveBeenCalled();
    });

    it('should handle basicPost that returns a valid HTTP response', () => {
        component.sendTimeToServer();
        component.message.subscribe((res) => {
            expect(res).toContain('201 : Created');
        });
    });

    it('should handle basicPost that returns an invalid HTTP response', () => {
        communicationServiceSpy.basicPost.and.returnValue(throwError(() => new Error('test')));
        component.sendTimeToServer();
        component.message.subscribe({
            next: (res) => {
                expect(res).toContain('Le serveur ne répond pas');
            },
        });
    });
});
