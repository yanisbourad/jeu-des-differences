import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiveUpMessagePopupComponent } from './give-up-message-popup.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';

describe('GiveUpMessagePopupComponent', () => {
    let component: GiveUpMessagePopupComponent;
    let fixture: ComponentFixture<GiveUpMessagePopupComponent>;
    let router: Router;
    let dialog: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GiveUpMessagePopupComponent],
            imports: [RouterTestingModule, MatDialogModule],
        }).compileComponents();

        fixture = TestBed.createComponent(GiveUpMessagePopupComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        dialog = TestBed.inject(MatDialog);
        spyOn(router, 'navigate');
        spyOn(dialog, 'closeAll');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to "/home" and close dialog', () => {
        component.redirect();
        expect(router.navigate).toHaveBeenCalledWith(['/home']);
        expect(dialog.closeAll).toHaveBeenCalled();
    });
});
