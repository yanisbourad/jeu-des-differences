/* eslint-disable no-restricted-imports */
/* eslint-disable deprecation/deprecation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { PlayerWaitPopupComponent } from '../player-wait-popup/player-wait-popup.component';
import { NamePopupComponent } from './name-popup.component';

describe('NamePopupComponent', () => {
    let component: NamePopupComponent;
    let fixture: ComponentFixture<NamePopupComponent>;
    let route: Router;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    const dialogRefSpy = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        close: () => {},
    };

    beforeEach(() => {
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'afterClosed']);
        TestBed.configureTestingModule({
            imports: [MatDialogModule, RouterTestingModule],
            declarations: [NamePopupComponent, PlayerWaitPopupComponent],
            providers: [
                { provider: MatDialog, useValue: dialogSpy },
                { provide: MatDialogRef, useValue: dialogRefSpy },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { name: '', gameName: 'gameName', gameType: 'double' },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(NamePopupComponent);
        component = fixture.componentInstance;
        route = TestBed.get(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should initialize data.name to an empty string', () => {
        component.ngOnInit();
        expect(component.data.name).toBe(' ');
    });
    it('should call close', () => {
        const spy = spyOn(component.dialogRef, 'close').and.callThrough();
        component.onNoClick();
        expect(spy).toHaveBeenCalled();
    });
    it('should open dialog calling launchDialog for 1v1 popup', () => {
        const dialogCloseSpy = jasmine.createSpyObj('MatDialog', ['afterClosed']);
        dialogSpy.open.and.returnValue(dialogCloseSpy);
        component.data.gameType = 'double';
        component.data.gameName = 'gameName';
        component.data.name = 'player';
        component.launchDialog();
        // expect(dialogSpy.open).toHaveBeenCalledWith(PlayerWaitPopupComponent, {
        //     data: { name: component.data.name, gameName: component.data.gameName, gameType: component.data.gameType },
        //     disableClose: true,
        //     height: '600px',
        //     width: '500px',
        // });
        expect(dialogCloseSpy.afterClosed).toHaveBeenCalled();
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
