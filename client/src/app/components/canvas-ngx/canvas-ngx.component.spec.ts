import { ComponentFixture, TestBed } from '@angular/core/testing';

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
});
