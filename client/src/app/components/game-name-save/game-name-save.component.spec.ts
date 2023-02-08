import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameNameSaveComponent } from './game-name-save.component';

describe('GameNameSaveComponent', () => {
    let component: GameNameSaveComponent;
    let fixture: ComponentFixture<GameNameSaveComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameNameSaveComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameNameSaveComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
