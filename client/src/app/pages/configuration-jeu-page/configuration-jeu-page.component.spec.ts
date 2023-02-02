import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationJeuPageComponent } from './configuration-jeu-page.component';

describe('ConfigurationJeuPageComponent', () => {
  let component: ConfigurationJeuPageComponent;
  let fixture: ComponentFixture<ConfigurationJeuPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigurationJeuPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurationJeuPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
