import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameInfo } from '@common/game';
import { NamePopupComponent } from '../name-popup/name-popup.component';
import { ButtonFourDirective, ButtonOneDirective, ButtonThreeDirective, ButtonTwoDirective, GameCardComponent } from './game-card.component';
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

//         component.openDialog();

//         expect(spy).toHaveBeenCalledWith(NamePopupComponent, { data: { name: undefined, gameName: 'Test' } });  // Check if dialog is opened with correct parameters

//     });

//     it('should change button text to "Classique" when on classique page', () => {  // Check if button text is changed correctly when on different pages

//         const result = spyOnProperty(component['router'], 'url').and.returnValue('/classique'); // Mock router url to classique page

//         component.changeButton();  // Call function to check result

//         expect(result).toBe('Classique'); // Check if result is correct

//     });
//     it('should change button text to "Classique" when on configuration page', () => {  // Check if button text is changed correctly when on different pages

//         const result = spyOnProperty(component['router'], 'url').and.returnValue('/configuration'); // Mock router url to classique page

//         component.changeButton();  // Call function to check result

//         expect(result).toBe('Configuration'); // Check if result is correct

//     });


// });
