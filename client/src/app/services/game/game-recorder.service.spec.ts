import { TestBed } from '@angular/core/testing';

import { GameMessageEvent } from '@app/classes/game-records/message-event';
import { SocketClientService } from '@app/services/socket/socket-client.service';
import { Subject } from 'rxjs';
import { GameRecorderService } from './game-recorder.service';
import { GameService } from './game.service';

fdescribe('GameRecorderService', () => {
    let service: GameRecorderService;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let socketClientSpy: jasmine.SpyObj<SocketClientService>;
    const messageToAdd = new Subject<GameMessageEvent>();
    beforeEach(() => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['']);
        socketClientSpy = jasmine.createSpyObj('SocketClientService', ['messageToAdd$', 'getRoomTime']);
        socketClientSpy.messageToAdd$ = messageToAdd.asObservable();

        TestBed.configureTestingModule({
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: SocketClientService, useValue: socketClientSpy },
            ],
        });
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameRecorderService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should do the messageToAdd subscription', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const nestMessage = { do: () => {} } as unknown as GameMessageEvent;
        const spy = spyOn(nestMessage, 'do');
        messageToAdd.next(nestMessage);
        expect(spy).toHaveBeenCalled();
    });

    it('should return the pausing status', () => {
        expect(service.isPaused).toEqual(service.paused);
    });

    it('should return the current time', () => {
        socketClientSpy.getRoomTime.and.returnValue(0);
        expect(service.currentTime).toEqual(0);
    });
});
