import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;
    // TODO : implement it using the time received from the server
    beforeEach(async () => {
        // timer = jasmine.createSpyObj('ClientTimeService', ['getCount']);
        await TestBed.configureTestingModule({
            declarations: [TimerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TimerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return the time in a string format', () => {
        component.time = { minute: 15, second: 10 };
        expect(component.formatTime()).toBe('15:10');
    });

    it('should add a 0 to the beginning of single digit minutes and seconds', () => {
        component.time = { minute: 4, second: 3 };
        expect(component.formatTime()).toBe('04:03');
    });

    it('transform should call setTime', () => {
        spyOn(component, 'setTime');
        component.transform();
        expect(component.setTime).toHaveBeenCalled();
    });

    // TODO
    it('should return the time in the correct format when second and minute are under 10', () => {
        const expectedResult = '01:05';
        component.transform();
        expect(component.transform()).toEqual(expectedResult);
    });

    // TODO
    it('should return the time in the correct format when second and minute are over 10', () => {
        const expectedResult = '20:15';
        // const countStub = 1215;
        // timer.getCount.and.returnValue(countStub);
        component.transform();
        expect(component.transform()).toEqual(expectedResult);
    });
});
