import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawingToolBarComponent } from './drawing-tool-bar.component';

describe('DrawingToolBarComponent', () => {
  let component: DrawingToolBarComponent;
  let fixture: ComponentFixture<DrawingToolBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrawingToolBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawingToolBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
