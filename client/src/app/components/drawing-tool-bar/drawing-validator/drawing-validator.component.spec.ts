import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingValidatorComponent } from './drawing-validator.component';

describe('DrawingValidatorComponent', () => {
  let component: DrawingValidatorComponent;
  let fixture: ComponentFixture<DrawingValidatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrawingValidatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawingValidatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
