import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionJeuPageComponent } from './selection-jeu-page.component';

describe('SelectionJeuPageComponent', () => {
    let component: SelectionJeuPageComponent;
    let fixture: ComponentFixture<SelectionJeuPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SelectionJeuPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SelectionJeuPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
