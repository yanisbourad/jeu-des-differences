import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { GameCardHandlerService } from '@app/services/game/game-card-handler-service.service';
import { GameRecorderService } from '@app/services/game/game-recorder.service';
import { GameService } from '@app/services/game/game.service';
import { SocketClientService } from '@app/services/socket/socket-client.service';
import { PlayerWaitPopupComponent } from '@app/components/player-wait-popup/player-wait-popup.component';
import { GeneralFeedbackComponent } from '@app/components/general-feedback/general-feedback.component';
import * as constantsTime from '@app/configuration/const-time';
import { MessageDialogComponent } from './message-dialog.component';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('MessageDialogComponent', () => {
    let component: MessageDialogComponent;
    let fixture: ComponentFixture<MessageDialogComponent>;
    let mockData;
    let router: Router;
    const mockDialogRef = {
        close: jasmine.createSpy('close'),
    };

    const mockGameService = {
        playerName: 'Player 1',
    };

    const mockSocketClientService = {
        connect: jasmine.createSpy('connect'),
        leaveRoom: jasmine.createSpy('leaveRoom'),
        getRoomName: jasmine.createSpy('getRoomName').and.returnValue('testRoom'),
        sendGiveUp: jasmine.createSpy('sendGiveUp'),
        sendMessage: jasmine.createSpy('sendMessage'),
        startTimeLimit: jasmine.createSpy('startTimeLimit'),
    };

    const mockGameRecorderService = {
        rewindSpeed: 1,
        do: jasmine.createSpy('do'),
        startRewind: jasmine.createSpy('startRewind'),
        stopRewind: jasmine.createSpy('stopRewind'),
    };

    const mockGameCardHandlerService = {
        connect: jasmine.createSpy('connect'),
    };

    beforeEach(async () => {
        mockData = {
            name: 'Test Player',
            gameName: 'Test Game',
            message: 'Test Message',
            gameType: 'Test Type',
            formatTime: 'Test Time',
            type: 'Test',
        };
        await TestBed.configureTestingModule({
            declarations: [MessageDialogComponent],
            imports: [MatDialogModule, RouterTestingModule],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: mockData },
                { provide: GameService, useValue: mockGameService },
                { provide: SocketClientService, useValue: mockSocketClientService },
                { provide: GameRecorderService, useValue: mockGameRecorderService },
                { provide: GameCardHandlerService, useValue: mockGameCardHandlerService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MessageDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should rewind game and leave room', () => {
        component.rewindGame();
        expect(mockSocketClientService.leaveRoom).toHaveBeenCalled();
        expect(mockGameRecorderService.rewindSpeed).toBe(1);
        expect(mockGameRecorderService.startRewind).toHaveBeenCalled();
    });

    it('should call socket service connect method and start time limit', () => {
        mockSocketClientService.connect.and.returnValue(of(true));
        mockSocketClientService.startTimeLimit.and.returnValue(of(true));

        component.launchSolo();

        expect(mockSocketClientService.connect).toHaveBeenCalled();
        expect(mockSocketClientService.startTimeLimit).toHaveBeenCalledWith('Player 1');
    });

    it('should navigate to the game page with correct parameters', fakeAsync(() => {
        router = TestBed.inject(Router);
        const navigateSpy = spyOn(router, 'navigate').and.stub();

        component.launchSolo();

        tick(constantsTime.LOADING);

        expect(navigateSpy).toHaveBeenCalledWith(['/game', { player: 'Test Player', gameType: 'solo', mode: 'tempsLimite' }]);
    }));

    it('should open feedback dialog with correct message', () => {
        const message = 'Test message';
        const openSpy = spyOn(component.dialog, 'open').and.stub();

        component.launchFeedback(message);

        expect(openSpy).toHaveBeenCalledWith(GeneralFeedbackComponent, {
            data: { message },
            disableClose: true,
        });
    });
    it('should connect to game card handler service and open player wait popup', () => {
        const openSpy = spyOn(component.dialog, 'open').and.stub();
        component.launchCooperation();
        expect(mockGameCardHandlerService.connect).toHaveBeenCalled();
        expect(openSpy).toHaveBeenCalledWith(PlayerWaitPopupComponent, {
            data: { name: component.data.name, gameName: component.data.gameName, gameType: 'tempsLimite' },
            disableClose: true,
            panelClass: 'custom-dialog-container',
            minHeight: 'fit-content',
            minWidth: 'fit-content',
        });
    });

    it('should call sendGiveUp, sendMessage and record on GameRecorderService when type is giveUp', () => {
        component.data.type = 'giveUp';
        const roomName = 'testRoom';
        const playerName = 'Player 1';
        mockSocketClientService.getRoomName.and.returnValue(roomName);
        router = TestBed.inject(Router);
        const navigateSpy = spyOn(router, 'navigate').and.stub();
        component.redirection();

        expect(mockSocketClientService.sendGiveUp).toHaveBeenCalledWith({ playerName, roomName });
        expect(mockSocketClientService.sendMessage).toHaveBeenCalledOnceWith({
            message: jasmine.any(String),
            playerName,
            color: '#FF0000',
            pos: '50%',
            gameId: roomName,
            event: true,
        });
        expect(navigateSpy).toHaveBeenCalledWith(['/home']);
    });

    it('should call leaveRoom and navigate when type is not giveUp', () => {
        router = TestBed.inject(Router);
        const navigateSpy = spyOn(router, 'navigate').and.stub();
        component.redirection();

        expect(mockSocketClientService.leaveRoom).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['/home']);
    });
});
