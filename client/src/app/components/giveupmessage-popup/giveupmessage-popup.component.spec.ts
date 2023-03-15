import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiveupmessagePopupComponent } from './giveupmessage-popup.component';

describe('GiveupmessagePopupComponent', () => {
  let component: GiveupmessagePopupComponent;
  let fixture: ComponentFixture<GiveupmessagePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GiveupmessagePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiveupmessagePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
