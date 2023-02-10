import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardDisplayerComponent } from './card-displayer.component';

describe('CardDisplayerComponent', () => {
    let component: CardDisplayerComponent;
    let fixture: ComponentFixture<CardDisplayerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CardDisplayerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CardDisplayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should call getAllCards on ngOnInit', () => {
        spyOn(component, 'getAllCards');
        component.ngOnInit();
        expect(component.getAllCards).toHaveBeenCalled();
    });
});
