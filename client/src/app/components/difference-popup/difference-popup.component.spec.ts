import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DrawService } from '@app/services/draw.service';
import { ImageDiffService } from '@app/services/image-diff.service';
import { DifferencePopupComponent } from './difference-popup.component';
import SpyObj = jasmine.SpyObj;

describe('DifferencePopupComponent', () => {
    let component: DifferencePopupComponent;
    let fixture: ComponentFixture<DifferencePopupComponent>;

    let imageDiffServiceSpy: SpyObj<ImageDiffService>;
    let drawServiceSpy: SpyObj<DrawService>;
    let dialogSpy: SpyObj<MatDialog>;
    let dialogRefSpy: SpyObj<MatDialogRef<DifferencePopupComponent>>;
    let changeDetectorRefSpy: SpyObj<ChangeDetectorRef>;

    beforeEach(() => {
        imageDiffServiceSpy = jasmine.createSpyObj('ImageDiffService', ['listDifferencesLength', 'listDifferences']);
        drawServiceSpy = jasmine.createSpyObj('DrawService', ['clearCanvas', 'drawAllDiff']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef<GameNameSaveComponent>', ['close', 'afterClosed']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DifferencePopupComponent],
            providers: [
                { provide: ImageDiffService, useValue: imageDiffServiceSpy },
                { provide: MatDialog, useValue: dialogSpy },
                { provide: MatDialogRef<DifferencePopupComponent>, useValue: dialogRefSpy },
                { provide: DrawService, useValue: drawServiceSpy },
                { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DifferencePopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        component.showValidation = false;
        component.lowerLimitDifferenceAllowed = 2;
        component.upperLimitDifferenceAllowed = 10;
        expect(component).toBeTruthy();
    });

    it('should call methods for needed services', () => {
        component.showDifference = 8;
        component.lowerLimitDifferenceAllowed = 2;
        component.upperLimitDifferenceAllowed = 10;
        component.ngAfterViewInit();
        expect(imageDiffServiceSpy.listDifferencesLength).toBeTruthy();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawServiceSpy.drawAllDiff).toHaveBeenCalled();
    });

    it('should communicate no feedback message on valid name', () => {
        component.showDifference = 8;
        component.lowerLimitDifferenceAllowed = 2;
        component.upperLimitDifferenceAllowed = 10;
        component.handleOutputMessage();
        expect(component.showMessage).toBe('');
        expect(component.showValidation).toBeTruthy();
    });

    it('should not communicate feedback message on invalid name ', () => {
        component.showDifference = 1;
        component.lowerLimitDifferenceAllowed = 2;
        component.upperLimitDifferenceAllowed = 10;
        component.handleOutputMessage();
        expect(component.showMessage).toBe('(valide entre 3 et 9)');
        expect(component.showValidation).toBeFalsy();
    });

    it('should open Game Name dialog ', () => {
        component.showValidation = true;
        component.showDifference = 7;
        component.lowerLimitDifferenceAllowed = 2;
        component.upperLimitDifferenceAllowed = 10;
        component.openName();
        expect(dialogSpy.open).toHaveBeenCalled();
    });

    it('should close pop up on call ', () => {
        component.closeOnAbort();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });
});
