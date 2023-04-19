/* eslint-disable no-restricted-imports */
/* eslint-disable deprecation/deprecation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GeneralFeedbackComponent } from '@app/components/general-feedback/general-feedback.component';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { PlayerWaitPopupComponent } from '@app/components/player-wait-popup/player-wait-popup.component';
import { NamePopupComponent } from './name-popup.component';
import SpyObj = jasmine.SpyObj;

describe('NamePopupComponent', () => {
    let component: NamePopupComponent;
    let fixture: ComponentFixture<NamePopupComponent>;
    let route: Router;
    const data = { name: 'test', gameName: 'gameName', gameType: 'double' };
    const mockData = { name: 'test', gameName: 'gameName', message: 'Veuillez sélectionner un mode de jeu', type: 'timeLimit' };
    let dialogRefSpy: SpyObj<MatDialogRef<NamePopupComponent>>;

    beforeEach(() => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef<NamePopupComponent>', ['close', 'afterClosed']);
    });

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, RouterTestingModule, BrowserAnimationsModule, HttpClientTestingModule],
            declarations: [NamePopupComponent, PlayerWaitPopupComponent, GeneralFeedbackComponent],
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
        expect(component.data.name).toBe('');
    });
    it('should return true if the name is valid', () => {
        expect(component.validatePlayerName('test')).toBeTrue();
        expect(component.validatePlayerName('      ')).toBeFalse();
        expect(component.validatePlayerName('te')).toBeFalse();
        expect(component.validatePlayerName('VIRTUAL QUEST')).toBeFalse();
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

    // test for launchFeedback
    it('should call launchFeedback when button is pressed', () => {
        const spy = spyOn(component.dialog, 'open').and.callThrough();
        component.launchFeedback('test');
        expect(spy).toHaveBeenCalledWith(GeneralFeedbackComponent, {
            data: { message: 'test' },
            disableClose: true,
            panelClass: 'custom-dialog-container',
            minHeight: 'fit-content',
            minWidth: 'fit-content',
        });
    });
    it('should call launchFeedback when launchDialog  is called', () => {
        component.data.name = '';
        spyOn(component, 'launchFeedback').and.callThrough();
        component.launchDialog();
        expect(component.launchFeedback).toHaveBeenCalled();
    });
    it('should call launchDialog when button is pressed', () => {
        const spy = spyOn(component.dialog, 'open').and.callThrough();
        component.data.name = 'test';
        component.data.gameType = 'double';
        component.launchDialog();
        expect(spy).toHaveBeenCalledWith(PlayerWaitPopupComponent, {
            data,
            disableClose: true,
            panelClass: 'custom-dialog-container',
            minHeight: 'fit-content',
            minWidth: 'fit-content',
        });
    });
    it('should call launchGameTypeSelection when button is pressed', () => {
        const spy = spyOn(component.dialog, 'open').and.callThrough();
        component.data.name = 'test';
        component.data.gameType = 'double';
        component.launchGameTypeSelection();
        expect(spy).toHaveBeenCalledWith(MessageDialogComponent, {
            data: mockData,
            disableClose: true,
            minWidth: '250px',
            minHeight: '110px',
            panelClass: 'custom-dialog-container',
        });
    });

    it('should redirect to the game route on redirect', () => {
        spyOn(route, 'navigate');
        component.data.name = 'player';
        component.data.gameType = 'solo';
        component.redirect();
        expect(route.navigate).toHaveBeenCalledWith(['/game', Object({ player: 'player', gameName: 'gameName', gameType: 'solo' })]);
    });
    it('should launch modal on calling redirect', () => {
        component.data.name = 'deeff';
        spyOn(component, 'launchDialog');
        component.data.gameType = 'double';
        component.redirect();
        expect(component.launchDialog).toHaveBeenCalled();
    });
    it('should call validatePlayerName on calling redirect', () => {
        component.data.name = '';
        spyOn(component, 'launchFeedback');
        component.data.gameType = 'double';
        component.redirect();
        expect(component.launchFeedback).toHaveBeenCalled();
    });
    it('should call launchFeedback on calling launGameTypeSelection', () => {
        component.data.name = '';
        spyOn(component, 'launchFeedback');
        component.launchGameTypeSelection();
        expect(component.launchFeedback).toHaveBeenCalled();
    });
});
