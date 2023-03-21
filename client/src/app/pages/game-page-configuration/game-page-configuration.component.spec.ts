import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePageConfigurationComponent } from './game-page-configuration.component';

describe('GamePageConfigurationComponent', () => {
    let component: GamePageConfigurationComponent;
    let fixture: ComponentFixture<GamePageConfigurationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageConfigurationComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePageConfigurationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
