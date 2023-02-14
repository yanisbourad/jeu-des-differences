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
        imageDiffServiceSpy = jasmine.createSpyObj('ImageDiffService', ['listDifferences']);
        imageDiffServiceSpy = jasmine.createSpyObj('DrawService', ['clearCanvas', 'drawAllDiff']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef<GameNameSaveComponent>', ['close']);
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
        component.showMessage = '';
        component.lowerLimitDifferenceAllowed = 3;
        component.upperLimitDifferenceAllowed = 9;
        component.showDifference = 5;
        expect(component).toBeTruthy();
    });

    it('should communicate game name to be saved to the server on valid name', () => {
        component.showDifference = 5;
        component.lowerLimitDifferenceAllowed = 3;
        component.upperLimitDifferenceAllowed = 9;
        component.ngAfterViewInit();
        expect(imageDiffServiceSpy.listDifferences.length).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(drawServiceSpy.drawAllDiff).toHaveBeenCalled();
    });

    it('should not communicate game name to be saved to the server on invalid name ', () => {
        component.showValidation = false;
        component.openName();
        expect(dialogSpy.open).toHaveBeenCalled();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should close pop up on call ', () => {
        component.closeOnAbort();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });
});
