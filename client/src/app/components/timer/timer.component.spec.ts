import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocketClientService } from '@app/services/socket-client.service';
import { TimerComponent } from './timer.component';
import spyObj = jasmine.SpyObj;

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;
    let socket: spyObj<SocketClientService>;

    beforeEach(async () => {
        socket = jasmine.createSpyObj('SocketClientService', ['getRoomTime', 'getRoomName']);
        await TestBed.configureTestingModule({
            declarations: [TimerComponent],
            providers: [{ provide: SocketClientService, useValue: socket }],
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

    it('should return the time in the correct format when second and minute are under 10', () => {
        const expectedResult = '05:05';
        const countStub = 305;
        socket.getRoomTime.and.returnValue(countStub);
        component.transform();
        expect(component.transform()).toEqual(expectedResult);
    });

    it('should return the time in the correct format when second and minute are over 10', () => {
        const expectedResult = '20:15';
        const countStub = 1215;
        socket.getRoomTime.and.returnValue(countStub);
        component.transform();
        expect(component.transform()).toEqual(expectedResult);
    });
});
