import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RewindControlBarComponent } from './rewind-control-bar.component';

describe('RewindControlBarComponent', () => {
    let component: RewindControlBarComponent;
    let fixture: ComponentFixture<RewindControlBarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RewindControlBarComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(RewindControlBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
