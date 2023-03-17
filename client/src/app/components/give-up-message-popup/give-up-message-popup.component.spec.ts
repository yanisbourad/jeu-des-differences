import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiveUpMessagePopupComponent } from './give-up-message-popup.component';

describe('GiveUpMessagePopupComponent', () => {
    let component: GiveUpMessagePopupComponent;
    let fixture: ComponentFixture<GiveUpMessagePopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GiveUpMessagePopupComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GiveUpMessagePopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
