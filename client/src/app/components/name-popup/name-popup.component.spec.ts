import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { NamePopupComponent } from './name-popup.component';

describe('NamePopupComponent', () => {
    let component: NamePopupComponent;
    let fixture: ComponentFixture<NamePopupComponent>;
    let route: Router;
    const dialogRefSpy = {
        close: () => {},
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, RouterTestingModule],
            declarations: [NamePopupComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { name: '', gameName: 'gameName' },
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
        expect(component.data.name).toBe('');
    });
    it('should call close', () => {
        const spy = spyOn(component.dialogRef, 'close').and.callThrough();
        component.onNoClick();
        expect(spy).toHaveBeenCalled();
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
        component.redirect();
        expect(route.navigate).toHaveBeenCalledWith(['/game', { player: 'player', gameName: 'gameName' }]);
    });
});
