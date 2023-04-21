import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { GameRecordCommand } from '@app/classes/game-record';
import { GameMessageEvent } from '@app/classes/game-records/message-event';
import { SEC_TO_MILLISEC, UNIT_DELAY_INTERVAL } from '@app/configuration/const-time';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { SocketClientService } from '@app/services/socket/socket-client.service';
import { Subject } from 'rxjs';
import { GameRecorderService } from './game-recorder.service';
import { GameService } from './game.service';

describe('GameRecorderService', () => {
    let service: GameRecorderService;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let socketClientSpy: jasmine.SpyObj<SocketClientService>;
    const messageToAdd = new Subject<GameMessageEvent>();
    const gamePage = { initForRewind: jasmine.createSpy('initForRewind').and.returnValue(0) } as unknown as GamePageComponent;
    beforeEach(() => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['']);
        socketClientSpy = jasmine.createSpyObj('SocketClientService', ['messageToAdd$', 'getRoomTime', 'getRoomName', 'gameTime']);
        socketClientSpy.messageToAdd$ = messageToAdd.asObservable();
        TestBed.configureTestingModule({
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: SocketClientService, useValue: socketClientSpy },
            ],
        });
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameRecorderService);
        const command = {
            do: () => {
                expect(true).toBeTrue();
            },
            gameTime: () => {
                expect(true).toBeTrue();
                return 1;
            },

            penalty: 1,
        };
        service.page = gamePage;

        service.list = [command, command, command, command] as unknown as GameRecordCommand[];
    });

    afterEach(() => {
        service.stopRewind();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should do the messageToAdd subscription', () => {
        const nextMessage = {
            do: () => {
                return;
            },
        } as unknown as GameMessageEvent;
        const spy = spyOn(nextMessage, 'do');
        messageToAdd.next(nextMessage);
        expect(spy).toHaveBeenCalled();
    });

    it('should return the pausing status', () => {
        expect(service.isPaused).toEqual(service.paused);
    });

    it('should return the current time', () => {
        socketClientSpy.getRoomTime.and.returnValue(0);
        expect(service.currentTime).toEqual(0);

        socketClientSpy.getRoomTime.and.returnValue(1);
        expect(service.currentTime).toEqual(1);

        socketClientSpy.getRoomTime.and.returnValue(NaN);
        expect(service.currentTime).toEqual(0);
    });

    it('should toggle the value of paused', () => {
        expect(service.isPaused).toBeFalse();
        service.togglePause();
        expect(service.isPaused).toBeTrue();
        service.togglePause();
        expect(service.isPaused).toBeFalse();
    });

    it('should return the current time in milliseconds without penalty', () => {
        const nbrOfSeconds = 3;
        const penalty = 1;
        socketClientSpy.getRoomTime.and.returnValue(nbrOfSeconds);
        service.sumPenalty = penalty;
        expect(service.currentTimeInMillisecondsWithoutPenalty).toEqual((nbrOfSeconds - penalty) * SEC_TO_MILLISEC);
    });

    it('should return the max time', () => {
        gameServiceSpy.gameTime = 5;
        expect(service.maxTime).toEqual(gameServiceSpy.gameTime + 1);
    });

    it('should return the timeout delay', () => {
        const speed = 2;
        service.speed = speed;
        expect(service.timeoutDelay).toEqual(UNIT_DELAY_INTERVAL / speed);
    });

    it('should set the starting time', () => {
        const time = 5;
        service.timeStart = time;
        expect(service.startingTime).toEqual(time);
    });

    it('should set the speed', fakeAsync(() => {
        // test if there is no timeout
        let speed = 2;
        service.rewindSpeed = speed;
        expect(service.speed).toEqual(speed);

        // should throw error if the speed is less than 1
        speed = 0;
        expect(() => {
            service.rewindSpeed = speed;
        }).toThrowError();

        // test if there is a timeout
        speed = 3;
        const mille = 1000;
        const clearIntervalSpy = spyOn(window, 'clearInterval').and.callThrough();
        service.myTimeout = setInterval(() => {
            expect(true).toBeTrue();
        }, mille);
        service.rewindSpeed = speed;
        expect(clearIntervalSpy).toHaveBeenCalled();
        service.stopRewind();
        speed = 1;
    }));

    it('should set the gamePage reference', () => {
        service.page = gamePage;
        expect(service.gamePage).toEqual(gamePage);
        // should instantiate the list of commands and the position of the current command
        expect(service.list).toEqual([]);
        expect(service.position).toEqual(0);
    });

    it('startRewind should set the sumPenalty to 0', () => {
        service.sumPenalty = 2;
        service.list = [
            {
                do: () => {
                    expect(true).toBeTrue();
                },
                gameTime: () => {
                    return 0;
                },
            },
        ] as unknown as GameRecordCommand[];
        service.startRewind(gamePage);
        expect(service.sumPenalty).toEqual(0);
    });

    it('startRewind should call initForRewind on the gamePage', () => {
        service.list = [
            {
                do: () => {
                    expect(true).toBeTrue();
                },
                gameTime: () => {
                    return 0;
                },
            },
        ] as unknown as GameRecordCommand[];
        service.startRewind(gamePage);
        expect(gamePage.initForRewind).toHaveBeenCalled();
    });

    it('startRewind should throw error if the list of actions is empty', () => {
        service.list = [] as unknown as GameRecordCommand[];
        expect(() => service.startRewind(gamePage)).toThrowError();
    });

    it('lunchRewind should clearInterval if its defined', () => {
        const timeout = 1000;
        service.myTimeout = setInterval(() => {
            expect(true).toBeTrue();
        }, timeout);
        const clearIntervalSpy = spyOn(window, 'clearInterval').and.callThrough();
        service.startRewind(gamePage);
        expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('lunchRewind should call the do function of the current action', fakeAsync(() => {
        const roomTime = 10000;
        const tickTime = 4000;
        socketClientSpy.getRoomTime.and.returnValue(roomTime);
        service.speed = 1;
        service.startRewind();
        tick(tickTime);
        expect(service.sumPenalty).toEqual(service.list.length);
        service.stopRewind();
    }));
});
