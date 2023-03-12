import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerWaitPopupComponent } from './player-wait-popup.component';

describe('PlayerWaitPopupComponent', () => {
    let component: PlayerWaitPopupComponent;
    let fixture: ComponentFixture<PlayerWaitPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayerWaitPopupComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerWaitPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
