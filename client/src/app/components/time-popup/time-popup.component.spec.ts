import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import * as constants from '@app/configuration/const-time';
import { TimePopupComponent } from './time-popup.component';

describe('TimePopupComponent', () => {
    let component: TimePopupComponent;
    let fixture: ComponentFixture<TimePopupComponent>;
    let decrementButton: HTMLButtonElement;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TimePopupComponent],
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            providers: [{ provide: MatDialogRef, useValue: { close: () => {} } }],
        }).compileComponents();
        fixture = TestBed.createComponent(TimePopupComponent);
        component = fixture.componentInstance;
        decrementButton = fixture.debugElement.query(By.css('#buttonTime3')).nativeElement;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default timer1 value of TIMER_1_INIT', () => {
        expect(component.timer1).toBe(constants.TIMER_1_INIT);
    });

    it('should have default timer2 value of TIMER_2_INIT', () => {
        expect(component.timer2).toBe(constants.TIMER_2_INIT);
    });

    it('should have default timer3 value of TIMER_3_INIT', () => {
        expect(component.timer3).toBe(constants.TIMER_3_INIT);
    });

    it('should increase timer1 by TIMER_INCREMENT', () => {
        const originalValue = component.timer1;
        component.incrementTime1();
        expect(component.timer1).toBe(originalValue + constants.TIMER_INCREMENT);
    });

    it('should decrease timer1 by TIMER_INCREMENT', () => {
        const originalValue = component.timer1;
        component.decrementTime1();
        expect(component.timer1).toBe(originalValue - constants.TIMER_INCREMENT);
    });

    it('should increase timer2 by TIMER_INCREMENT', () => {
        const originalValue = component.timer2;
        component.incrementTime2();
        expect(component.timer2).toBe(originalValue + constants.TIMER_INCREMENT);
    });

    it('should decrease timer2 by TIMER_INCREMENT', () => {
        const originalValue = component.timer2;
        component.decrementTime2();
        expect(component.timer2).toBe(originalValue - constants.TIMER_INCREMENT);
    });

    it('should increase timer3 by TIMER_INCREMENT', () => {
        const originalValue = component.timer3;
        component.incrementTime3();
        expect(component.timer3).toBe(originalValue + constants.TIMER_INCREMENT);
    });
    it('should decrease timer3 by TIMER_INCREMENT', () => {
        const originalValue = component.timer3;
        component.decrementTime3();
        expect(component.timer3).toBe(originalValue - constants.TIMER_INCREMENT);
    });
    it('should call close', () => {
        const spy = spyOn(component.dialogRef, 'close').and.callThrough();
        component.onNoClick();
        expect(spy).toHaveBeenCalled();
    });
    it('should disable the decrement button if timer3 is 0', () => {
        component.timer3 = 0;
        fixture.detectChanges();
        expect(decrementButton.disabled).toBe(true);
    });

    it('should enable the decrement button if timer3 is greater than 0', () => {
        component.timer3 = 1;
        fixture.detectChanges();
        expect(decrementButton.disabled).toBe(false);
    });

    it('should call decrementTime3() when the button is clicked', () => {
        spyOn(component, 'decrementTime3').and.callThrough();
        decrementButton.click();
        expect(component.decrementTime3).toHaveBeenCalled();
    });
});
