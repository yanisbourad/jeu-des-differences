import { ComponentFixture, TestBed } from '@angular/core/testing';
import SpyObj = jasmine.SpyObj;
// eslint-disable-next-line no-restricted-imports
import { ImageDiffService } from '../../services/image-diff.service';
import { ValidateCreateBtnComponent } from './validate-create-btn.component';

describe('ValidateCreateBtnComponent', () => {
    let component: ValidateCreateBtnComponent;
    let fixture: ComponentFixture<ValidateCreateBtnComponent>;

    let imageDiffServiceSpy: SpyObj<ImageDiffService>;
    beforeEach(() => {
        imageDiffServiceSpy = jasmine.createSpyObj('ImageDiffService', [
            'resetImageData',
            'setPixelMatrix',
            'getDifferenceMatrix',
            'defineDifferences',
        ]);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ValidateCreateBtnComponent],
            providers: [{ provide: ImageDiffService, useValue: imageDiffServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(ValidateCreateBtnComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not set pixel arrays and should call resetImageData', () => {
        component.onClick();
        expect(imageDiffServiceSpy.resetImageData).toHaveBeenCalled();
        expect(imageDiffServiceSpy.setPixelMatrix).toHaveBeenCalled();
        expect(imageDiffServiceSpy.getDifferenceMatrix).toHaveBeenCalled();
        expect(imageDiffServiceSpy.defineDifferences).toHaveBeenCalled();
    });
});
