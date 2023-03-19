import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GeneralFeedbackComponent } from './general-feedback.component';
import SpyObj = jasmine.SpyObj;

describe('GeneralFeedbackComponent', () => {
    let component: GeneralFeedbackComponent;
    let fixture: ComponentFixture<GeneralFeedbackComponent>;

    let dialogSpy: SpyObj<MatDialogRef<GeneralFeedbackComponent>>;
    const data = { message: 'data' };

    beforeEach(() => {
        dialogSpy = jasmine.createSpyObj('MatDialogRef<GeneralFeedbackComponent>', ['close']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GeneralFeedbackComponent],
            imports: [MatDialogModule],
            providers: [
                { provide: MatDialogRef<GeneralFeedbackComponent>, useValue: dialogSpy },
                { provide: MAT_DIALOG_DATA, useValue: data },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GeneralFeedbackComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should pass the received message to view', () => {
        component.ngOnInit();
        expect(component.message).toBe('data');
    });
    it('should close pop up method call', () => {
        component.onClose();
        expect(component.message).toBe('');
        expect(dialogSpy.close).toHaveBeenCalled();
    });
});
