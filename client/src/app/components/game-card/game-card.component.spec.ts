import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameCardComponent } from './game-card.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { NamePopupComponent } from '../name-popup/name-popup.component';
import { GameInfo } from '@common/game';
//import { GameInfoComponent } from '../game-info/game-info.component';
//import { GameDatabaseService } from '@app/services/game-database.service';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    //let dialog: MatDialog;
    //let router: Router;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardComponent, NamePopupComponent],
            imports: [  MatDialogModule, RouterTestingModule, BrowserAnimationsModule],
            providers : [{ provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }],
        }).compileComponents();
        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        //dialog = TestBed.inject(MatDialog);
        //router = TestBed.inject(Router);

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

        expect(spy).toHaveBeenCalledWith(NamePopupComponent, { data: { name: undefined, gameName: 'difference 1' } });  // Check if dialog is opened with correct parameters 

    });

    it('should change button text to "Classique" when on classique page', () => {  // Check if button text is changed correctly when on different pages 

        component.url = '/classique'
        const type = component.changeButton(); 
        expect(type).toEqual('Classique'); 

    });
    it('should change button text to "Classique" when on configuration page', () => {  // Check if button text is changed correctly when on different pages 

        component.url = '/config'; // Mock router url to classique page 

        const type = component.changeButton();  // Call function to check result 
        expect(type).toEqual('Configuration');

    });  


});
