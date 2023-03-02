import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawService } from '@app/services/draw.service';
import { ImageDiffService } from '@app/services/image-diff.service';
import { DrawingToolBarComponent } from './drawing-tool-bar.component';
import SpyObj = jasmine.SpyObj;

describe('DrawingToolBarComponent', () => {
    let component: DrawingToolBarComponent;
    let fixture: ComponentFixture<DrawingToolBarComponent>;
    let drawServiceSpy: SpyObj<DrawService>;
    let imageDiffServiceSpy: SpyObj<ImageDiffService>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawService', ['setLineWidth', 'setColor']);
        imageDiffServiceSpy = jasmine.createSpyObj('ImageDiffService', ['setRadius']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DrawingToolBarComponent],
            providers: [
                { provide: DrawService, useValue: drawServiceSpy },
                { provide: ImageDiffService, useValue: imageDiffServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DrawingToolBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call set method on service when setLineWidth is called', () => {
        component.lineWidth = 1;
        component.setLineWidth();
        expect(drawServiceSpy.setLineWidth).toEqual(1);
    });

    it('should set Color on service when setColor is called', () => {
        component.lineColor = '#000000';
        component.setLineColor();
        expect(drawServiceSpy.setColor).toEqual('#000000');
    });

    it('should set radius on service when setRadius is called', () => {
        component.selectedRadius = 1;
        component.setRadius();
        expect(imageDiffServiceSpy.setRadius).toEqual(1);
    });
});
