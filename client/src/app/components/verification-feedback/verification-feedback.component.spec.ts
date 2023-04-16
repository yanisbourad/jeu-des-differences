import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificationFeedbackComponent } from './verification-feedback.component';

describe('VerificationFeedbackComponent', () => {
    let component: VerificationFeedbackComponent;
    let fixture: ComponentFixture<VerificationFeedbackComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VerificationFeedbackComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(VerificationFeedbackComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
