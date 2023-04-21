import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import * as constants from '@app/configuration/const-time';
import { GameDatabaseService } from '@app/services/game/game-database.service';
import { TimeConfig } from '@common/game';
import { of } from 'rxjs';
import { TimePopupComponent } from './time-popup.component';
import { VerificationFeedbackComponent } from '@app/components/verification-feedback/verification-feedback.component';

const mockConstants: TimeConfig = {
    timeInit: constants.INIT_TIME,
    timePen: constants.PENALTY_TIME,
    timeBonus: constants.BONUS_TIME,
};

describe('TimePopupComponent', () => {
    let component: TimePopupComponent;
    let fixture: ComponentFixture<TimePopupComponent>;
    let decrementButton: HTMLButtonElement;
    let communicationServiceSpy: jasmine.SpyObj<GameDatabaseService>;
    let dialog: MatDialog;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<TimePopupComponent>>;
    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('GameDatabaseService', ['getConstants', 'updateConstants']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef<NamePopupComponent>', ['close', 'afterClosed']);
        TestBed.configureTestingModule({
            declarations: [TimePopupComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                {
                    provide: MatDialog,
                    useValue: {
                        open: () => {
                            return;
                        },
                    },
                },
                { provide: GameDatabaseService, useValue: communicationServiceSpy },
            ],
        }).compileComponents();
        communicationServiceSpy.getConstants.and.callFake(() => of(mockConstants));
        communicationServiceSpy.updateConstants.and.callFake(() => of());
        dialog = TestBed.inject(MatDialog);
        fixture = TestBed.createComponent(TimePopupComponent);
        component = fixture.componentInstance;
        decrementButton = fixture.debugElement.query(By.css('#buttonTime3')).nativeElement;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default timer1 value of TIMER_1_INIT', () => {
        expect(component.timer1).toBe(constants.INIT_TIME);
    });

    it('should have default timer2 value of TIMER_2_INIT', () => {
        expect(component.timer2).toBe(constants.PENALTY_TIME);
    });

    it('should have default timer3 value of TIMER_3_INIT', () => {
        expect(component.timer3).toBe(constants.BONUS_TIME);
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
        component.onNoClick();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should call decrementTime3() when the button is clicked', () => {
        spyOn(component, 'decrementTime3').and.callThrough();
        decrementButton.click();
        expect(component.decrementTime3).toHaveBeenCalled();
    });

    it('should call updateConstants', () => {
        component.onModify();
        expect(communicationServiceSpy.updateConstants).toHaveBeenCalled();
    });

    // test resetConstants()
    it('should reset timer1 to INIT_TIME', () => {
        component.timer1 = 0;
        component.resetConstants();
        communicationServiceSpy.getConstants().subscribe((res: TimeConfig) => {
            component.timer1 = res.timeInit;
            component.timer2 = res.timePen;
            component.timer3 = res.timeBonus;
        });
        expect(component.timer1).toBe(constants.INIT_TIME);
    });

    it('should call launchDialog when button is pressed', () => {
        const spyOpen = spyOn(dialog, 'open').and.returnValue({
            afterClosed: () => of(null),
        } as MatDialogRef<unknown>);
        const data = 'test';
        component.launchFeedback(data);
        expect(spyOpen).toHaveBeenCalledWith(VerificationFeedbackComponent, {
            data: { message: data, confirmFunction: jasmine.any(Function) },
            disableClose: true,
            panelClass: 'custom-dialog-container',
            minHeight: 'fit-content',
            minWidth: 'fit-content',
        });
    });

    it('should update timer variables when isReset is true', fakeAsync(() => {
        const getConstantsSpy = communicationServiceSpy.getConstants.and.returnValue(of(mockConstants));
        component.isReset = true;
        component.ngAfterContentChecked();
        tick();
        expect(getConstantsSpy).toHaveBeenCalled();
        expect(component.timer1).toBe(mockConstants.timeInit);
        expect(component.timer2).toBe(mockConstants.timePen);
        expect(component.timer3).toBe(mockConstants.timeBonus);
    }));
});
