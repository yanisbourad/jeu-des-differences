import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as constants from '@app/configuration/const-canvas';
import { CanvasNgxComponent } from './canvas-ngx.component';

describe('CanvasNgxComponent', () => {
    let component: CanvasNgxComponent;
    let fixture: ComponentFixture<CanvasNgxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CanvasNgxComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CanvasNgxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should have a canvas', () => {
        const canvas = fixture.nativeElement.querySelector('canvas');
        expect(canvas).toBeTruthy();
    });
    it('should have a canvas with the right size', () => {
        const canvas = fixture.nativeElement.querySelector('canvas');
        expect(canvas.width).toEqual(constants.DEFAULT_WIDTH);
        expect(canvas.height).toEqual(constants.DEFAULT_HEIGHT);
    });
});
