import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateCreateBtnComponent } from './validate-create-btn.component';

describe('ValidateCreateBtnComponent', () => {
    let component: ValidateCreateBtnComponent;
    let fixture: ComponentFixture<ValidateCreateBtnComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ValidateCreateBtnComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ValidateCreateBtnComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
