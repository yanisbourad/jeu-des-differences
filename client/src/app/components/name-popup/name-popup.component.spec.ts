/* eslint-disable no-restricted-imports */
/* eslint-disable deprecation/deprecation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerWaitPopupComponent } from '../player-wait-popup/player-wait-popup.component';
import { NamePopupComponent } from './name-popup.component';
import SpyObj = jasmine.SpyObj;

describe('NamePopupComponent', () => {
    let component: NamePopupComponent;
    let fixture: ComponentFixture<NamePopupComponent>;
    let route: Router;
    const data = { name: 'test', gameName: 'gameName', gameType: 'double' };
    let dialogRefSpy: SpyObj<MatDialogRef<NamePopupComponent>>;

    beforeEach(() => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef<NamePopupComponent>', ['close', 'afterClosed']);
        // dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    });

    beforeEach(async () => {
        // dialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'afterClosed']);
        TestBed.configureTestingModule({
            imports: [MatDialogModule, RouterTestingModule],
            declarations: [NamePopupComponent, PlayerWaitPopupComponent],
            providers: [
                // { provider: MatDialog, useValue: dialogSpy },
                { provide: MatDialogRef<NamePopupComponent>, useValue: dialogRefSpy },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: data,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(NamePopupComponent);
        component = fixture.componentInstance;
        route = TestBed.get(Router);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should initialize data.name to an empty string', () => {
        component.ngOnInit();
        expect(component.data.name).toBe(' ');
    });
    it('should return true if the name is valid', () => {
        expect(component.validateGameName('test')).toBeTrue();
        expect(component.validateGameName('      ')).toBeFalse();
        expect(component.validateGameName('te')).toBeFalse();
        expect(component.validateGameName('VIRTUAL QUEST')).toBeFalse();
    });
    it('should call close', () => {
        component.onNoClick();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should call onNoClick when button is pressed', () => {
        spyOn(component, 'onNoClick');
        const bouton = fixture.debugElement.query(By.css('#cancel-button'));
        bouton.triggerEventHandler('click', null);

        expect(component.onNoClick).toHaveBeenCalledTimes(1);
    });
    it('should redirect to the game route on redirect', () => {
        spyOn(route, 'navigate');
        component.data.name = 'player';
        component.data.gameType = 'solo';
        component.redirect();
        expect(route.navigate).toHaveBeenCalledWith(['/game', { player: 'player', gameName: 'gameName' }]);
    });
});
