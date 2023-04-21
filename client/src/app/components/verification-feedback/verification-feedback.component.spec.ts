import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { VerificationFeedbackComponent } from './verification-feedback.component';
import SpyObj = jasmine.SpyObj;

describe('VerificationFeedbackComponent', () => {
    let component: VerificationFeedbackComponent;
    let fixture: ComponentFixture<VerificationFeedbackComponent>;
    // let windowReloadSpy: jasmine.SpyObj<VerificationFeedbackComponent>;
    let dialogSpy: SpyObj<MatDialogRef<VerificationFeedbackComponent>>;
    const data = {
        message: 'data',
        confirmFunction: () => {
            return;
        },
    };

    beforeEach(async () => {
        dialogSpy = jasmine.createSpyObj('MatDialogRef<VerificationFeedbackComponent>', ['close']);
        // windowReloadSpy = jasmine.createSpyObj(component, ['windowReload']);
        await TestBed.configureTestingModule({
            declarations: [VerificationFeedbackComponent],
            imports: [MatDialogModule],
            providers: [
                { provide: MatDialogRef<VerificationFeedbackComponent>, useValue: dialogSpy },
                { provide: MAT_DIALOG_DATA, useValue: data },
                {
                    provide: location,
                    useValue: {
                        reload: () => {
                            return;
                        },
                    },
                },
            ],
        }).compileComponents();

        // windowReloadSpy.windowReload.and.callFake(() => {
        //     console.log('reloaded');
        // });
        fixture = TestBed.createComponent(VerificationFeedbackComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call dialog reference close method on onClose', () => {
        component.onClose();
        expect(dialogSpy.close).toHaveBeenCalled();
    });

    it('should call confirm function and close dialog on confirm', () => {
        const confirmSpy = spyOn(component.data, 'confirmFunction');
        const windowReloadSpy = spyOn(component, 'windowReload');
        component.onConfirm();

        expect(confirmSpy).toHaveBeenCalled();
        expect(windowReloadSpy).toHaveBeenCalled();
        expect(dialogSpy.close).toHaveBeenCalled();
    });
});
