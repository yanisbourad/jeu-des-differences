import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DifferencePopupComponent } from './difference-popup.component';

describe('DifferencePopupComponent', () => {
    let component: DifferencePopupComponent;
    let fixture: ComponentFixture<DifferencePopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DifferencePopupComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(DifferencePopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
