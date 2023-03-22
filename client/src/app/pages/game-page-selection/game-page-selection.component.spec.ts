import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePageSelectionComponent } from './game-page-selection.component';

describe('GamePageSelectionComponent', () => {
    let component: GamePageSelectionComponent;
    let fixture: ComponentFixture<GamePageSelectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageSelectionComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePageSelectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
