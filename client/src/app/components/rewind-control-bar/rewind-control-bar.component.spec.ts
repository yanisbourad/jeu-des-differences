import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Router } from '@angular/router';
import { GameRecorderService } from '@app/services/game/game-recorder.service';
import { Subject } from 'rxjs';
import { RewindControlBarComponent } from './rewind-control-bar.component';

fdescribe('RewindControlBarComponent', () => {
    let component: RewindControlBarComponent;
    let fixture: ComponentFixture<RewindControlBarComponent>;
    let gameRecorderService: jasmine.SpyObj<GameRecorderService>;
    let router: jasmine.SpyObj<Router>;
    let process: Subject<number>;
    beforeEach(async () => {
        gameRecorderService = jasmine.createSpyObj('GameRecorderService', ['rewindSpeed', 'progress$', 'stopRewind', 'startRewind', 'togglePause']);
        gameRecorderService.stopRewind.and.callThrough();
        process = new Subject<number>();
        gameRecorderService.progress$ = process;
        router = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            declarations: [RewindControlBarComponent],
            providers: [
                { provide: GameRecorderService, useValue: gameRecorderService },
                { provide: Router, useValue: router },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(RewindControlBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set the rewindSpeed on gameRecorderService', () => {
        component.updateSpeed();
        expect(gameRecorderService.rewindSpeed).toEqual(component.speed);
        component.speed += 1;
        component.updateSpeed();
        expect(gameRecorderService.rewindSpeed).toEqual(component.speed);
    });

    it(' should update the process', () => {
        let newProcess = 0.5;
        process.next(newProcess);
        expect(component.process).toEqual(newProcess);
        newProcess = 2;
        process.next(newProcess);
        expect(component.process).toEqual(newProcess);
    });

    it('should call startRewind on gameRecorderService', () => {
        component.restart();
        expect(gameRecorderService.startRewind).toHaveBeenCalled();
    });

    it('should call togglePause on gameRecorderService', () => {
        component.togglePause();
        expect(gameRecorderService.togglePause).toHaveBeenCalled();
    });

    it('should call stopRewind on gameRecorderService and redirect to mainPage', () => {
        component.redirect();
        expect(gameRecorderService.stopRewind).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
});
