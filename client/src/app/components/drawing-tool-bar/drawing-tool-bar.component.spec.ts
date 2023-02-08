import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawService } from '@app/services/draw.service';

import { DrawingToolBarComponent } from './drawing-tool-bar.component';

describe('DrawingToolBarComponent', () => {
    let component: DrawingToolBarComponent;
    let fixture: ComponentFixture<DrawingToolBarComponent>;
    let drawService: DrawService;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DrawingToolBarComponent],
            providers: [DrawService],
        }).compileComponents();

        fixture = TestBed.createComponent(DrawingToolBarComponent);
        // eslint-disable-next-line deprecation/deprecation
        drawService = TestBed.get(DrawService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call set method on service when setLineWidth is called', () => {
        component.lineWidth = 1;
        component.setLineWidth();
        expect(drawService.getLineWidth).toBe(1);
        component.lineWidth = 3;
        component.setLineWidth();
        expect(drawService.getLineWidth).toBe(3);
    });
    it('should set Color on service when setColor is called', () => {
        component.lineColor = '#000000';
        component.setLineColor();
        expect(drawService.getColor).toBe('#000000');
        component.lineColor = '#FFFFFF';
        component.setLineColor();
        expect(drawService.getColor).toBe('#FFFFFF');
    });
});
