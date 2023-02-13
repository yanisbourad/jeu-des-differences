import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import * as constants from '@app/configuration/const-canvas';
// import { Vec2 } from '@app/interfaces/vec2';
import { ClientTimeService } from '@app/services/client-time.service';
import { DrawService } from '@app/services/draw.service';
import { GameService } from '@app/services/game.service';
import { SocketClientService } from '@app/services/socket-client.service';
// import { of } from 'rxjs';
import { GamePageComponent } from './game-page.component';
import SpyObj = jasmine.SpyObj;

const DEFAULT_NAME = 'defaultName';
const DEFAULT_PLAYER = 'defaultPlayer';

class ActivatedRouteMock {
    params = { subscribe: jasmine.createSpy('subscribe') };
    snapshot = {
        paramMap: {
            get: jasmine.createSpy('get').and.returnValues(DEFAULT_PLAYER, DEFAULT_NAME),
        },
    };
}

fdescribe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    // const canvas1: HTMLCanvasElement;
    // const canvas2: HTMLCanvasElement;
    // const ctx1: CanvasRenderingContext2D;
    // const ctx2: CanvasRenderingContext2D;
    let timeServiceSpy: SpyObj<ClientTimeService>;
    let gameServiceSpy: SpyObj<GameService>;
    let socketClientServiceSpy: SpyObj<SocketClientService>;
    let drawserviceSpy: SpyObj<DrawService>;
    let dialogSpy: SpyObj<MatDialog>;
    // let routeSpy: SpyObj<ActivatedRoute>;
    // let routeSpy: SpyObj<ActivatedRoute>;
    // const  mousePosition: Vec2;
    // const errorPenalty: boolean;
    // const  unfoundedDifference: Set<number>[];
    // const playerName: string;
    // const gameName: string;

    beforeEach(() => {
        timeServiceSpy = jasmine.createSpyObj('ClientTimeService', ['stopTimer', 'resetTimer', 'startTimer']);
        gameServiceSpy = jasmine.createSpyObj('GameService', [
            'displayIcons',
            'playFailureAudio',
            'playSuccessAudio',
            'clickDifferencesFound',
            'blinkDifference',
            'getGame',
        ]);
        socketClientServiceSpy = jasmine.createSpyObj('SocketClientService', ['']);
        drawserviceSpy = jasmine.createSpyObj('DrawService', ['drawWord', 'drawDiff', 'clearDiff']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        gameServiceSpy.game = {
            gameName: 'game1',
            difficulty: 'string',
            originalImageData: 'string',
            modifiedImageData: 'string',
            listDifferences: [],

        }

        // routeSpy = jasmine.createSpyObj('ActivatedRoute', ['']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent],
            providers: [
                { provide: ClientTimeService, useValue: timeServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: SocketClientService, useValue: socketClientServiceSpy },
                { provide: DrawService, useValue: drawserviceSpy },
                { provide: MatDialog, useValue: dialogSpy },
                { provide: ActivatedRoute, useValue: ActivatedRouteMock },
            ],
            imports: [MatDialogModule],
        }).compileComponents();
        // gameServiceSpy.getGame.and.callFake(()=>{of()})
        // routeSpy.paramMap.callFake(()=>{of({gameName:"", player:""})})
        fixture = TestBed.createComponent(GamePageComponent);
        // const canvas1 = fixture.nativeElement.querySelector('canvas1');
        // const canvas2 = fixture.nativeElement.querySelector('canvas2');

        // TODO: use camelCase
        component = fixture.componentInstance;
        (component as any).route = new ActivatedRouteMock();
        fixture.detectChanges();
        console.log(component.route.snapshot.paramMap.get('test'));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return the default height', () => {
        const spy = spyOnProperty(component, 'height').and.returnValue(constants.defaultHeight);
        expect(component.height).toBe(constants.defaultHeight);
        expect(spy).toHaveBeenCalled();
    });

    it('should return the default width', () => {
        const spy = spyOnProperty(component, 'height').and.returnValue(constants.defaultWidth);
        expect(component.width).toBe(constants.defaultWidth);
        expect(spy).toHaveBeenCalled();
    });

    // it('should retrieve player name and game name from the URL', () => {
    //     const playerName = 'player1';
    //     const gameName = 'game1';
    //     spyOn
    //     spyOn(routeSpy.snapshot.paramMap, 'get').and.callFake((key:string) => {
    //       if (key as string === 'player') {
    //         return playerName;
    //       } else if (key as string === 'gameName') {
    //         return gameName;
    //       }
    //     });

    //     component.getRouteurParams();

    //     expect(component.playerName).toBe(playerName);
    //     expect(component.gameName).toBe(gameName);
    //   });

    it('should call ngOnDestroy()', () => {
        spyOn(component, 'ngOnDestroy').and.callThrough();

        component.ngOnDestroy();

        expect(component.ngOnDestroy).toHaveBeenCalled(); // check if ngOnDestroy is called
        expect(component.clientTimeService.stopTimer).toHaveBeenCalled(); // check if clientTimeService stopTimer is called
        expect(component.socket.disconnect).toHaveBeenCalled(); // check if socket disconnect is called
        expect(component.clientTimeService.resetTimer).toHaveBeenCalled(); // check if clientTimeService resetTimer is called
        expect(component.socket.leaveRoom).toHaveBeenCalled(); // check if socket leaveRoom is called
        expect(component.gameName).toEqual(''); // check if gameName is set to empty string
    });

    it('ngOninit() should call getGame() from gameService', () => {
        spyOn(gameServiceSpy, 'getGame');
        component.ngOnInit();
        expect(gameServiceSpy.getGame).toHaveBeenCalled();
    });

    it('ngOninit() should call displayIcons() from gameService', () => {
        spyOn(gameServiceSpy, 'displayIcons');
        component.ngOnInit();
        expect(gameServiceSpy.displayIcons).toHaveBeenCalled();
    });

    it('ngOninit() should call loading() from timeService', () => {
        spyOn(component, 'loading');
        component.ngOnInit();
        expect(component.loading).toHaveBeenCalled();
    });

    it('ngAfterViewInit() should call connect from SocketClientSerive', () => {
        spyOn(component.socket, 'connect');
        component.ngAfterViewInit();
        expect(component.socket.connect).toHaveBeenCalled();
    });

    it('ngAfterViewInit() should call joinRoom from SocketClientSerive', () => {
        spyOn(socketClientServiceSpy, 'joinRoom');
        component.ngAfterViewInit();
        expect(socketClientServiceSpy.joinRoom).toHaveBeenCalled();
    });

    it('ngAfterViewInit() should call startTimer from timeService', () => {
        spyOn(timeServiceSpy, 'startTimer');
        component.ngAfterViewInit();
        expect(timeServiceSpy.startTimer).toHaveBeenCalled();
    });

    it('ngAfterViewInit() should call displayIcons() from gameService', () => {
        spyOn(gameServiceSpy, 'displayIcons');
        component.ngAfterViewInit();
        expect(gameServiceSpy.displayIcons).toHaveBeenCalled();
    });

    it('ngAfterViewInit() should set color to yellow', () => {
        component.ngAfterViewInit();
        expect(drawserviceSpy['setColor']).toEqual('yellow');
    });

    it('should stop timer, disconnect socket and reset timer', () => {
        spyOn(timeServiceSpy, 'stopTimer');
        spyOn(socketClientServiceSpy, 'disconnect');
        spyOn(timeServiceSpy, 'resetTimer');

        component.ngOnDestroy();

        expect(timeServiceSpy.stopTimer).toHaveBeenCalled();
        expect(socketClientServiceSpy.disconnect).toHaveBeenCalled();
        expect(timeServiceSpy.resetTimer).toHaveBeenCalled();
    });

    it('should leave room and set gameName to empty string', () => {
        spyOn(socketClientServiceSpy, 'leaveRoom');
        component.ngOnDestroy();
        expect(socketClientServiceSpy.leaveRoom).toHaveBeenCalled();
        expect(component.gameName).toEqual('');
    });

    it('loading() should call getSetDifference()', () => {
        jasmine.clock().install();
        spyOn(component, 'getSetDifference').and.callThrough();
        component.loading();
        jasmine.clock().tick(500);
        expect(component.getSetDifference).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });
});
