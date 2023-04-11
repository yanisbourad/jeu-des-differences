import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GameNameSaveComponent } from '@app/components/game-name-save/game-name-save.component';
import * as constants from '@app/configuration/const-test';
import { DrawService } from '@app/services/draw/draw.service';
import { ImageDiffService } from '@app/services/image-diff/image-diff.service';
import { DifferencePopupComponent } from './difference-popup.component';

describe('DifferencePopupComponent', () => {
    let component: DifferencePopupComponent;
    let fixture: ComponentFixture<DifferencePopupComponent>;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;
    let imageDiffServiceSpy: jasmine.SpyObj<ImageDiffService>;
    let drawServiceSpy: jasmine.SpyObj<DrawService>;

    const dialogRefSpy = {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        close: () => {},
    };

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'afterClosed']);
        imageDiffServiceSpy = jasmine.createSpyObj('ImageDiffService', ['listDifferences']);
        drawServiceSpy = jasmine.createSpyObj('ImageDiffService', ['clearCanvas', 'drawAllDiff']);
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [DifferencePopupComponent, GameNameSaveComponent],
            providers: [
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: ImageDiffService, useValue: imageDiffServiceSpy },
                { provide: DrawService, useValue: drawServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DifferencePopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open settings dialog and close', () => {
        const dialogCloseSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogSpy.open.and.returnValue(dialogCloseSpy);
        component.showValidation = true;
        component.openName();
        expect(matDialogSpy.open).toHaveBeenCalledWith(GameNameSaveComponent, {
            disableClose: true,
            height: '250px',
            width: '500px',
        });
        expect(dialogCloseSpy.afterClosed).toHaveBeenCalled();
    });

    it('should call close', () => {
        const spy = spyOn(component.dialogRef, 'close').and.callThrough();
        component.closeOnAbort();
        expect(spy).toHaveBeenCalled();
    });

    it('should show validation', () => {
        component['imageDifferenceService'].listDifferences = [
            new Set(constants.FIRST_SET),
            new Set(constants.FIFTH_SET),
            new Set(constants.FOURTH_SET),
        ];
        component.ngAfterViewInit();
        expect(component.showMessage).toBe('');
        expect(component.showValidation).toBeTrue();
    });

    it('should not show validation', () => {
        component['imageDifferenceService'].listDifferences = [new Set(constants.FIRST_SET), new Set(constants.FIFTH_SET)];
        component.ngAfterViewInit();
        expect(component.showMessage).toBe('(valide entre 3 et 9)');
        expect(component.showValidation).toBeFalsy();
    });
});
