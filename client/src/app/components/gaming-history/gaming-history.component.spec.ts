import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameDatabaseService } from '@app/services/game-database.service';
import { GamingHistoryComponent } from './gaming-history.component';

describe('GamingHistoryComponent', () => {
    let component: GamingHistoryComponent;
    let fixture: ComponentFixture<GamingHistoryComponent>;
    let gameDatabaseServiceSpy: jasmine.SpyObj<GameDatabaseService>;

    beforeEach(async () => {
        gameDatabaseServiceSpy = jasmine.createSpyObj('GameDatabaseService', ['getAllGames']);
        await TestBed.configureTestingModule({
            declarations: [GamingHistoryComponent],
            providers: [{ provide: GameDatabaseService, useValue: gameDatabaseServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(GamingHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
