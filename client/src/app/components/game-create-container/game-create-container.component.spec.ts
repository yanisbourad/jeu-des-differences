import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCreateContainerComponent } from './game-create-container.component';

describe('GameCreateContainerComponent', () => {
  let component: GameCreateContainerComponent;
  let fixture: ComponentFixture<GameCreateContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameCreateContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameCreateContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
