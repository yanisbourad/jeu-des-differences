import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RewindControlBarComponent } from './rewind-control-bar.component';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GameRecorderService } from '@app/services/game/game-recorder.service';

describe('RewindControlBarComponent', () => {
    let component: RewindControlBarComponent;
    let fixture: ComponentFixture<RewindControlBarComponent>;
    let gameRecorderServiceSpy: jasmine.SpyObj<GameRecorderService>;
    beforeEach(async () => {
        gameRecorderServiceSpy = jasmine.createSpyObj('GameRecorderService', ['stopRewind', 'togglePause']);
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatDialogModule, HttpClientTestingModule],
            declarations: [RewindControlBarComponent],
            providers: [{ provide: GameRecorderService, useVlue: gameRecorderServiceSpy }],
        }).compileComponents();
        // gameRecorderServiceSpy.startRewind.and.callThrough();

        fixture = TestBed.createComponent(RewindControlBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('should update the rewind speed', () => {
    //     const expectedSpeed = 2;
    //     component.speed = expectedSpeed;
    //     component.updateSpeed();
    //     expect(2).toEqual(2);
    // });

    // it('should call startRewind method on gameRecorderService when restart is called', () => {
    //     spyOn(gameRecorderServiceSpy, 'startRewind').and.callFake(() => {
    //         console.log('startRewind called');
    //     });
    //     component.restart();
    //     expect(gameRecorderServiceSpy.startRewind).toHaveBeenCalled();
    // });
});
