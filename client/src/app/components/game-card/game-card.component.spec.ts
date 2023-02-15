import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameInfo } from '@common/game';
import { NamePopupComponent } from '../name-popup/name-popup.component';
import { GameCardComponent } from './game-card.component';
import { ButtonOneDirective, ButtonTwoDirective, ButtonThreeDirective, ButtonFourDirective } from './game-card.component';
describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardComponent, NamePopupComponent, ButtonOneDirective
            , ButtonTwoDirective, ButtonThreeDirective, ButtonFourDirective],
            imports: [  MatDialogModule, RouterTestingModule, BrowserAnimationsModule],
            providers : [{ provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }],
        }).compileComponents();
        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        component.card  = {
                        gameName: 'difference 1',
                        difficulty: 'Facile',
                        originalImageData: 'imageOriginal1',
                        modifiedImageData: 'imageModifie1',
                        listDifferences: ['diffrence 1', 'difference 2'],
                        rankingMulti: [ 
                            {    
                                gameName: 'difference 1',
                                typeGame: 'multi',
                                time: '1:23',
                                playerName: 'joueur 1',
                                dateStart: '2023-01-01'
                            }, 
                            {    
                                gameName: 'difference 1',
                                typeGame: 'multi',
                                time: '1:24',
                                playerName: 'joueur 1',
                                dateStart: '2023-01-01'
                            },
                            {    
                                gameName: 'difference 1',
                                typeGame: 'multi',
                                time: '1:25',
                                playerName: 'joueur 1',
                                dateStart: '2023-01-01'} ],
                        rankingSolo: [
                            {    
                                gameName: 'difference 2',
                                typeGame: 'solo',
                                time: '2:34',
                                playerName: 'joueur 2',
                                dateStart: '2023-02-02'
                            }, 
                            {    
                                gameName: 'difference 2',
                                typeGame: 'solo',
                                time: '2:34',
                                playerName: 'joueur 2',
                                dateStart: '2023-02-02'
                            }, 
                            {    
                                gameName: 'difference 2',
                                typeGame: 'mlyi',
                                time: '2:34',
                                playerName: 'joueur 2',
                                dateStart: '2023-02-02'
                            }, 
                         ],
                    } as GameInfo;
        fixture.detectChanges();

    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should open dialog', () => {
            const spy = spyOn(component.dialog, 'open').and.callThrough();
            component.openDialog();
            expect(spy).toHaveBeenCalledWith(NamePopupComponent, { data: { name: undefined, gameName: 'difference 1' } });
      }); 

    it('should change button text to "Classique" when on classique page', () =>{
        component.url = '/classique';
        const type = component.changeButton(); 
        expect(type).toEqual('Classique'); 
     });
    it('should change button text to "Configuration" when on configuration page', () =>{
        component.url = '/config'; 

        const type = component.changeButton(); 
        expect(type).toEqual('Configuration');

    });
    it ('should display the difficutly', () => {
        const p = fixture.nativeElement;
        expect(p.querySelector('#gameDifficulty').textContent).toContain('Difficulté: Facile');
    });
    it ('should display the name of the game', () => {
        const p = fixture.nativeElement;
        expect(p.querySelector('#gameName').textContent).toContain('difference 1');
    });
    it('should apply the ButtonOneDirective to the Jouer button', () => {
        component.url = '/classique';
        fixture.detectChanges();
    
        const button = fixture.debugElement.query(By.css('#playButton'));
        expect(button).not.toBeNull();
    
        const directive = button.injector.get(ButtonOneDirective);
        expect(directive).toBeDefined();
      });
    
      it('should not apply the ButtonOneDirective when the url is not /classique', () => {
        component.url = '/config';
        fixture.detectChanges();
    
        const button = fixture.nativeElement;
        expect(button.querySelector('#playButton').textContent).toContain('Supprimer');
      });
      it('should apply the ButtonTwoDirective to the Joindre button', () => {
        component.url = '/classique';
        fixture.detectChanges();
    
        const button = fixture.debugElement.query(By.css('#joinButton'));
        expect(button).not.toBeNull();
    
        const directive = button.injector.get(ButtonTwoDirective);
        expect(directive).toBeDefined();
      });
      it('should not apply the ButtonTwoDirective when the url is not /classique', () => {
        component.url = '/config';
        fixture.detectChanges();
    
        const button = fixture.nativeElement;
        expect(button.querySelector('#joinButton').textContent).toContain('Reinitialiser');
      });
      it('should not apply the ButtonThreeDirective when the url is not /classique', () => {
        component.url = '/classique';
        fixture.detectChanges();
    
        const button = fixture.nativeElement;
        expect(button.querySelector('#playButton').textContent).toContain('Jouer');
      });
      it('should not apply the ButtonFourDirective when the url is not /classique', () => {
        component.url = '/classique';
        fixture.detectChanges();
    
        const button = fixture.nativeElement;
        expect(button.querySelector('#joinButton').textContent).toContain('Joindre');
      });
      it('should apply the ButtonThreeDirective to the Supprimer button', () => {
        component.url = '/config';
        fixture.detectChanges();
    
        const button = fixture.debugElement.query(By.css('#playButton'));
        expect(button).not.toBeNull();
    
        const directive = button.injector.get(ButtonThreeDirective);
        expect(directive).toBeDefined();
      });
      it('should apply the ButtonFourDirective to the Reinitialiser button', () => {
        component.url = '/config';
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css('#joinButton'));
        expect(button).not.toBeNull();
    
        const directive = button.injector.get(ButtonFourDirective);
        expect(directive).toBeDefined();
      });
      it('should display the first one for solo game', () => {
        const firstRanking = fixture.nativeElement; 
        expect(firstRanking.querySelector('#firstSolo').textContent).toContain('2:34 joueur 2');
      });
      it('should display the first one for multi game', () => {
        const firstRanking = fixture.nativeElement; 
        expect(firstRanking.querySelector('#firstMulti').textContent).toContain('1:23 joueur 1');
      });
});
