import { OverlayModule } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameInfo } from '@common/game';
import { GameInfoComponent } from '../game-info/game-info.component';
// import { NamePopupComponent } from '../name-popup/name-popup.component';
import { GameCardComponent } from './game-card.component';

describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    let card: GameInfo;
    let matDialog: MatDialog;
    let router: Router;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardComponent],
            imports: [OverlayModule, MatDialogModule, RouterTestingModule],
            providers: [MatDialog, GameInfoComponent],
        }).compileComponents();
        matDialog = TestBed.inject(MatDialog);
        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        card.gameName = 'My Game';
        component = new GameCardComponent(matDialog, router);
        component.card = card;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should open dialog', () => {
        // const spy = spyOn(component.dialog, 'open').and.callThrough();

        component.openDialog();

        // expect(spy).toHaveBeenCalledWith(NamePopupComponent, { data: { name: undefined, gameName: 'Test' } }); // Check if dialog is opened with correct parameters
    });

    it('should change button text to "Classique" when on classique page', () => {
        // Check if button text is changed correctly when on different pages

        const result = spyOnProperty(component['router'], 'url').and.returnValue('/classique'); // Mock router url to classique page

        component.changeButton(); // Call function to check result

        expect(result).toBe('Classique'); // Check if result is correct
    });
    it('should change button text to "Classique" when on configuration page', () => {
        // Check if button text is changed correctly when on different pages

        const result = spyOnProperty(component['router'], 'url').and.returnValue('/configuration'); // Mock router url to classique page

        component.changeButton(); // Call function to check result

        expect(result).toBe('Configuration'); // Check if result is correct
    });
});
