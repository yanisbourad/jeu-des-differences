import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialogRef } from '@angular/material/dialog';
import * as constantsMock from '@app/configuration/const-mock';
import { GameDatabaseService } from '@app/services/game-database.service';
import { GamingHistory } from '@common/game';
import { of } from 'rxjs';
import { GamingHistoryComponent } from './gaming-history.component';

const mockGameRecords: GamingHistory[] = constantsMock.MOCK_GAME_RECORDS;

describe('GamingHistoryComponent', () => {
    let component: GamingHistoryComponent;
    let fixture: ComponentFixture<GamingHistoryComponent>;
    let gameDatabaseServiceSpy: jasmine.SpyObj<GameDatabaseService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<GamingHistoryComponent>>;

    beforeEach(async () => {
        gameDatabaseServiceSpy = jasmine.createSpyObj('GameDatabaseService', ['getAllGamingHistory', 'deleteGamingHistory']);
        await TestBed.configureTestingModule({
            declarations: [GamingHistoryComponent],
            providers: [
                { provide: GameDatabaseService, useValue: gameDatabaseServiceSpy },
                { provide: MatDialogRef, useValue: dialogRefSpy },
            ],
        }).compileComponents();

        // handle .subscribe() calls error in tests
        gameDatabaseServiceSpy.getAllGamingHistory.and.callFake(() => of(mockGameRecords));

        fixture = TestBed.createComponent(GamingHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
