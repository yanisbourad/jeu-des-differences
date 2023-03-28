import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HeaderComponent } from './header.component';
// import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { GamingHistoryComponent } from '@app/components/gaming-history/gaming-history.component';
import { TimePopupComponent } from '@app/components/time-popup/time-popup.component';
describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'afterClosed']);
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, RouterTestingModule],
            declarations: [HeaderComponent, TimePopupComponent],
            providers: [{ provide: MatDialog, useValue: matDialogSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have the game logo', () => {
        expect(component.logo).toEqual('https://cdn-icons-png.flaticon.com/512/8464/8464334.png');
        expect(component.title).toEqual('VQ');
    });

    it('should open settings dialog and close', () => {
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogSpy.open.and.returnValue(dialogRefSpy);
        component.openSettings();
        expect(matDialogSpy.open).toHaveBeenCalledWith(TimePopupComponent, {
            height: '774px',
            width: '1107px',
        });
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
    });
    it('should open gaming History dialog and close', () => {
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogSpy.open.and.returnValue(dialogRefSpy);
        component.openGamingHistory();
        expect(matDialogSpy.open).toHaveBeenCalledWith(GamingHistoryComponent, {
            height: '774px',
            width: '1107px',
        });
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
    });
    it('should redirect to new URL when redirect() is called', () => {
        component.newUrl = '/classique';
        const bool = component.redirect();
        expect(bool).toBe(true);
    });
});
