import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpResponse } from '@angular/common/http';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { VerificationFeedbackComponent } from '@app/components/verification-feedback/verification-feedback.component';
import * as constantsMock from '@app/configuration/const-mock';
import { GameDatabaseService } from '@app/services/game/game-database.service';
import { GamingHistory } from '@common/game';
import { of } from 'rxjs';
import { GamingHistoryComponent } from './gaming-history.component';

const mockGameRecords: GamingHistory[] = constantsMock.MOCK_GAME_RECORDS;

describe('GamingHistoryComponent', () => {
    let component: GamingHistoryComponent;
    let fixture: ComponentFixture<GamingHistoryComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<GamingHistoryComponent>>;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;
    let gameDatabaseServiceSpy: jasmine.SpyObj<GameDatabaseService>;

    beforeEach(async () => {
        gameDatabaseServiceSpy = jasmine.createSpyObj('GameDatabaseService', ['getAllGamingHistory', 'deleteGamingHistory']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [GamingHistoryComponent],
            providers: [
                { provide: GameDatabaseService, useValue: gameDatabaseServiceSpy },
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: MatDialog, useValue: matDialogSpy },
            ],
        }).compileComponents();

        // handle .subscribe() calls error in tests
        gameDatabaseServiceSpy.getAllGamingHistory.and.callFake(() => of(mockGameRecords));
        gameDatabaseServiceSpy.deleteGamingHistory.and.callFake(() => of(new HttpResponse({ body: 'OK', status: 200 })));

        fixture = TestBed.createComponent(GamingHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call close', () => {
        component.close();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should call getAllGamingHistory', () => {
        component.ngAfterContentChecked();
        expect(gameDatabaseServiceSpy.getAllGamingHistory).toHaveBeenCalled();
    });

    it('should call eraseGamingHistory', () => {
        component.eraseGamingHistory();
        expect(gameDatabaseServiceSpy.deleteGamingHistory).toHaveBeenCalled();
    });

    it('should call launchFeedback', () => {
        const dialogCloseSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogSpy.open.and.returnValue(dialogCloseSpy);
        component.launchFeedback();
        expect(matDialogSpy.open).toHaveBeenCalledWith(VerificationFeedbackComponent, {
            data: {
                message: "Voulez vous vraiment supprimer l'historique des parties?",
            },
            disableClose: true,
        });
        expect(dialogCloseSpy.afterClosed).toHaveBeenCalled();
    });
});
