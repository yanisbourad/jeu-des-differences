import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameCardComponent } from './game-card.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { NamePopupComponent } from '../name-popup/name-popup.component';
import { GameInfo } from '@common/game';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardComponent, NamePopupComponent],
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

});
