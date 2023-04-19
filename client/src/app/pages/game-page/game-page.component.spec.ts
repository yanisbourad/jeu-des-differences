import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { GamePageComponent } from './game-page.component';
import { GameService } from '@app/services/game/game.service';
import { SocketClientService } from '@app/services/socket/socket-client.service';
import { GameRecorderService } from '@app/services/game/game-recorder.service';
import { CheatModeService } from '@app/services/cheat-mode/cheat-mode.service';
import { HintsService } from '@app/services/hints/hints.service';
import { MessageAreaComponent } from '@app/components/message-area/message-area.component';
import { DrawService } from '@app/services/draw/draw.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
//import SpyObj = jasmine.SpyObj;
//import { of } from 'rxjs';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    // let gameService: GameService;
    // let socketClientService: SocketClientService;
    // let gameRecorderService: GameRecorderService;
    // let cheatModeService: CheatModeService;
    // let hintsService: HintsService;
    // let activatedRoute: ActivatedRoute;
    // let socketClientServiceSpy: SpyObj<SocketClientService>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, MessageAreaComponent],
            providers: [
                GameService,
                GameRecorderService,
                SocketClientService,
                CheatModeService,
                HintsService,
                DrawService,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: {
                                get: () => 'test',
                            },
                        },
                    },
                },
            ],
            imports: [RouterTestingModule, MatDialogModule, HttpClientModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        // gameService = TestBed.inject(GameService);
        // socketClientService = TestBed.inject(SocketClientService);
        // gameRecorderService = TestBed.inject(GameRecorderService);
        // cheatModeService = TestBed.inject(CheatModeService);
        // hintsService = TestBed.inject(HintsService);
        // activatedRoute = TestBed.inject(ActivatedRoute);
        // socketClientServiceSpy = jasmine.createSpyObj('SocketClientService', ['sendMessage', 'getRoomName', 'connect']);
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should set up the game for rewind and subscribe to game events', () => {
            //const numberSet = new Set<number>([1, 2, 3]);

            //spyOn(component, 'getRouterParams');
            spyOn(component.gameService, 'setStartDate');
            spyOn(component.gameService, 'handleDisconnect');
            spyOn(component, 'loading');
            spyOn(component, 'subscribeToGameStatus');
            spyOn(component, 'subscribeToTimeLimit');
            spyOn(component, 'subscribeToDifference');
            spyOn(component.cheatModeService, 'cheatModeKeyBinding');
            spyOn(component.hintsService, 'hintsKeyBinding');
            spyOn(component.hintsService, 'resetService');
            spyOn(component, 'loadImages');
            spyOn(component.cheatModeService, 'resetService');
            //spyOn(component.gameService, 'getSetDifference').and.returnValue(numberSet);
            //spyOn(component.gameRecordService, 'setPage');
            spyOn(component.socket, 'connect');
            //spyOn(component.socket, 'imageLoaded$').and.returnValue(of({}));
            spyOn(component.gameService, 'getTimeLimitGame');
            spyOn(component.gameService, 'getClassicGame');
            spyOn(component.gameService, 'initRewind');
            spyOn(component.cheatModeService, 'removeHotkeysEventListener');
            spyOn(component.hintsService, 'removeHotkeysEventListener');

            component.ngOnInit();

            //expect(component.getRouterParams).toHaveBeenCalled();
            expect(component.gameService.setStartDate).toHaveBeenCalled();
            expect(component.gameService.handleDisconnect).toHaveBeenCalled();
            expect(component.loading).toHaveBeenCalled();
            expect(component.subscribeToGameStatus).not.toHaveBeenCalled();
            expect(component.subscribeToTimeLimit).not.toHaveBeenCalled();
            expect(component.subscribeToDifference).not.toHaveBeenCalled();
            expect(component.cheatModeService.cheatModeKeyBinding).toHaveBeenCalled();
            expect(component.hintsService.hintsKeyBinding).not.toHaveBeenCalled();
            expect(component.hintsService.resetService).not.toHaveBeenCalled();
            expect(component.loadImages).not.toHaveBeenCalled();
            expect(component.cheatModeService.resetService).not.toHaveBeenCalled();
            //expect(component.gameService.getSetDifference).toHaveBeenCalled();
            //expect(component.gameRecordService.setPage).toHaveBeenCalledWith(component);
            expect(component.socket.connect).toHaveBeenCalled();
            //expect(component.socket.imageLoaded$).toHaveBeenCalled();
            expect(component.gameService.getTimeLimitGame).not.toHaveBeenCalled();
            expect(component.gameService.getClassicGame).toHaveBeenCalled();
            expect(component.gameService.initRewind).not.toHaveBeenCalled();
            expect(component.cheatModeService.removeHotkeysEventListener).not.toHaveBeenCalled();
            expect(component.hintsService.removeHotkeysEventListener).not.toHaveBeenCalled();
        });
    });
});
