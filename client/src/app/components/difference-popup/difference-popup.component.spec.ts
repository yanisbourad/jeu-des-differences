import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameNameSaveComponent } from '@app/components/game-name-save/game-name-save.component';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DifferencePopupComponent } from './difference-popup.component';
import { ImageDiffService } from '@app/services/image-diff.service';
import { DrawService } from '@app/services/draw.service';
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
            height: '600x',
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
        component['imageDifferenceService'].listDifferences = [new Set([1, 2, 3]), new Set([4, 5]), new Set([6, 7, 8, 9])];
        component.ngAfterViewInit();
        expect(component.showMessage).toBe('');
        expect(component.showValidation).toBeTrue();
    });

    it('should not show validation', () => {
        component['imageDifferenceService'].listDifferences = [new Set([1, 2, 3]), new Set([4, 5])];
        component.ngAfterViewInit();
        expect(component.showMessage).toBe('(valide entre 3 et 9)');
        expect(component.showValidation).toBeFalsy();
    });
});
