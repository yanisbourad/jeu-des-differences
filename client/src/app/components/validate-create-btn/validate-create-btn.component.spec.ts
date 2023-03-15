import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as constants from '@app/configuration/const-test';
import { CanvasHolderService } from '@app/services/canvas-holder.service';
import { ImageDiffService } from '@app/services/image-diff.service';
import { ValidateCreateBtnComponent } from './validate-create-btn.component';
import SpyObj = jasmine.SpyObj;

describe('ValidateCreateBtnComponent', () => {
    let component: ValidateCreateBtnComponent;
    let fixture: ComponentFixture<ValidateCreateBtnComponent>;

    let imageDiffServiceSpy: SpyObj<ImageDiffService>;
    let canvasHolderSpy: SpyObj<CanvasHolderService>;
    beforeEach(() => {
        imageDiffServiceSpy = jasmine.createSpyObj('ImageDiffService', [
            'resetImageData',
            'setPixelMatrix',
            'getDifferenceMatrix',
            'defineDifferences',
        ]);
        canvasHolderSpy = jasmine.createSpyObj('CanvasHolderService', ['getCanvasData']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ValidateCreateBtnComponent],
            providers: [
                { provide: ImageDiffService, useValue: imageDiffServiceSpy },
                { provide: CanvasHolderService, useValue: canvasHolderSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ValidateCreateBtnComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should launch detection system and generate differences between two images', () => {
        canvasHolderSpy.getCanvasData.and.returnValue(new Uint8ClampedArray(constants.FOURTH_SET));
        component.onClick();
        expect(canvasHolderSpy.getCanvasData).toHaveBeenCalledTimes(2);
        expect(imageDiffServiceSpy.resetImageData).toHaveBeenCalled();
        expect(imageDiffServiceSpy.setPixelMatrix).toHaveBeenCalled();
        expect(imageDiffServiceSpy.getDifferenceMatrix).toHaveBeenCalled();
        expect(imageDiffServiceSpy.defineDifferences).toHaveBeenCalled();
        expect(canvasHolderSpy.getCanvasData).toHaveBeenCalled();
    });
});
