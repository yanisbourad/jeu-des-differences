import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HeaderComponent } from './header.component';
// import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GamingHistoryComponent } from '@app/components/gaming-history/gaming-history.component';
import { TimePopupComponent } from '@app/components/time-popup/time-popup.component';
import { GameDatabaseService } from '@app/services/game/game-database.service';
import { of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { VerificationFeedbackComponent } from '@app/components/verification-feedback/verification-feedback.component';
describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let gameDatabaseServiceSpy: jasmine.SpyObj<GameDatabaseService>;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        gameDatabaseServiceSpy = jasmine.createSpyObj('GameDatabaseService', ['deleteGameRecords', 'deleteAllGames']);
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'afterClosed']);
        await TestBed.configureTestingModule({
            imports: [MatDialogModule, RouterTestingModule, BrowserAnimationsModule],
            declarations: [HeaderComponent, TimePopupComponent],
            providers: [
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: GameDatabaseService, useValue: gameDatabaseServiceSpy },
            ],
        }).compileComponents();
        const response = new HttpResponse({ status: 200, body: 'OK' });
        gameDatabaseServiceSpy.deleteAllGames.and.returnValue(of(response));
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
            disableClose: true,
            panelClass: 'custom-history',
        });
        expect(dialogRefSpy.afterClosed).toHaveBeenCalled();
    });
    it('should redirect to new URL when redirect() is called', () => {
        component.newUrl = '/classique';
        const bool = component.redirect();
        expect(bool).toBe(true);
    });
    // it('should call sendFeedback when button is pressed', () => {
    //     const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    //     matDialogSpy.open.and.returnValue(dialogRefSpy);
    //     component.sendFeedback('test');
    //     expect(matDialogSpy.open).toHaveBeenCalledWith(GeneralFeedbackComponent, {
    //         data: { message: 'test' },
    //         disableClose: true,
    //     });
    // });
    it('should call deleteGameRecords when button is pressed', () => {
        const gameDbServiceSpy = jasmine.createSpyObj('GameDatabaseService', ['subscribe']);
        gameDatabaseServiceSpy.deleteGameRecords.and.returnValue(gameDbServiceSpy);
        gameDbServiceSpy.subscribe.and.returnValue(gameDbServiceSpy);
        component.eraseGameRecords();
        expect(gameDatabaseServiceSpy.deleteGameRecords).toHaveBeenCalled();
        expect(gameDbServiceSpy.subscribe).toHaveBeenCalled();
    });

    it('should call deleteAllGames() on the gameDatabaseService', () => {
        component.resetGames();
        expect(gameDatabaseServiceSpy.deleteAllGames).toHaveBeenCalled();
    });

    it('should open a dialog with the given message and a confirm function that calls resetGames()', () => {
        const dialogCloseSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogSpy.open.and.returnValue(dialogCloseSpy);
        dialogCloseSpy.afterClosed.and.returnValue(of('test'));
        const msg = "Voulez vous vraiment supprimer l'historique des parties?";
        component.launchFeedbackResetGames(msg);
        expect(matDialogSpy.open).toHaveBeenCalledWith(VerificationFeedbackComponent, {
            data: {
                message: msg,
                confirmFunction: jasmine.any(Function),
            },
            disableClose: true,
            panelClass: 'custom-dialog-container',
            minHeight: 'fit-content',
            minWidth: 'fit-content',
        });
        expect(dialogCloseSpy.afterClosed).toHaveBeenCalled();
    });

    it('should open a dialog with the given message and a confirm function that calls launchFeedbackResetRecords()', () => {
        const dialogCloseSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogSpy.open.and.returnValue(dialogCloseSpy);
        dialogCloseSpy.afterClosed.and.returnValue(of('test'));
        const msg = "Voulez vous vraiment supprimer l'historique des parties?";
        component.launchFeedbackResetRecords(msg);
        expect(matDialogSpy.open).toHaveBeenCalledWith(VerificationFeedbackComponent, {
            data: {
                message: msg,
                confirmFunction: jasmine.any(Function),
            },
            disableClose: true,
            panelClass: 'custom-dialog-container',
            minHeight: 'fit-content',
            minWidth: 'fit-content',
        });
        expect(dialogCloseSpy.afterClosed).toHaveBeenCalled();
    });
});
