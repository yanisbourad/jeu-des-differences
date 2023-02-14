import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import * as constants from '@app/configuration/const-canvas';
import { HeaderComponent } from '@app/components/header/header.component';
import { GameInfoComponent } from '@app/components/game-info/game-info.component';
import { TimerComponent } from '@app/components/timer/timer.component';
// import { Vec2 } from '@app/interfaces/vec2';
import { ClientTimeService } from '@app/services/client-time.service';
import { DrawService } from '@app/services/draw.service';
import { GameService } from '@app/services/game.service';
import { SocketClientService } from '@app/services/socket-client.service';
// import { of } from 'rxjs';
import { GamePageComponent } from './game-page.component';
import SpyObj = jasmine.SpyObj;
import { HttpClientModule } from '@angular/common/http';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';

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
    let msg: string;
    let type: string;
    //let gameName: string
    // const  mousePosition: Vec2;
    // const errorPenalty: boolean;
    // const  unfoundedDifference: Set<number>[];
    // const playerName: string;
    // const gameName: string;

    beforeEach(() => {
        timeServiceSpy = jasmine.createSpyObj('ClientTimeService', ['stopTimer', 'resetTimer', 'startTimer', 'getCount']);
        gameServiceSpy = jasmine.createSpyObj('GameService', [
            'displayIcons',
            'playFailureAudio',
            'playSuccessAudio',
            'clickDifferencesFound',
            'blinkDifference',
            'getGame',
            'getSetDifference',
        ]);
        socketClientServiceSpy = jasmine.createSpyObj('SocketClientService', ['connect', 'joinRoom', 'disconnect', 'leaveRoom']);
        drawserviceSpy = jasmine.createSpyObj('DrawService', ['drawWord', 'drawDiff', 'clearDiff']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        gameServiceSpy.game = {
            gameName: 'game1',
            difficulty: 'string',
            originalImageData: 'string',
            modifiedImageData: 'string',
            listDifferences: [],
        }
        gameServiceSpy.gameInformation = {
            gameTitle: 'game1',
            gameMode: 'solo',
            gameDifficulty: 'facile',
            nDifferences: 1,
            nHints: 1,
            hintsPenalty: 5,
            isClassical: true,
        }
        msg = 'Êtes-vous sûr de vouloir abandonner la partie? Cette action est irréversible.';
        type = 'giveUp';
       // gameName = 'game1';
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamePageComponent, HeaderComponent, GameInfoComponent, TimerComponent],
            providers: [
                { provide: ClientTimeService, useValue: timeServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: SocketClientService, useValue: socketClientServiceSpy },
                { provide: DrawService, useValue: drawserviceSpy },
                { provide: MatDialog, useValue: dialogSpy },
                { provide: ActivatedRoute, useValue: ActivatedRouteMock },
            ],
            imports: [MatDialogModule, HttpClientModule],
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
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open a dialog with the given message and type', () => {
        component.displayGiveUp(msg, type);
        expect(dialogSpy.open).toHaveBeenCalledWith(MessageDialogComponent, {
            data: [msg, type],
            minWidth: '250px',
            minHeight: '150px',
            panelClass: 'custom-dialog-container'
        });
    }); 

    it('should call displayGiveUp when giveUp is called', () => {
        const spy = spyOn(component, 'displayGiveUp').and.callThrough();
        component.giveUp();
        expect(spy).toHaveBeenCalledWith(msg, type); 
    }); 

    it('should return the default height', () => {
        const spy = spyOnProperty(component, 'height').and.returnValue(constants.defaultHeight);
        expect(component[('height')]).toBe(constants.defaultHeight);
        console.log(component[('height')]);
        expect(spy).toHaveBeenCalled();
    });

    it('should return the default width', () => {
        const spy = spyOnProperty(component, 'width').and.returnValue(constants.defaultWidth);
        expect(component[('width')]).toBe(constants.defaultWidth);
        expect(spy).toHaveBeenCalled();
    });

    it('should call ngOnDestroy()', () => {
        const spy = spyOn(component, 'ngOnDestroy').and.callThrough();
        component.ngOnDestroy();
        expect(spy).toHaveBeenCalled();
        expect(timeServiceSpy.stopTimer).toHaveBeenCalled(); 
        expect(socketClientServiceSpy.disconnect).toHaveBeenCalled(); 
        expect(timeServiceSpy.resetTimer).toHaveBeenCalled(); 
        expect(socketClientServiceSpy.leaveRoom).toHaveBeenCalled(); 
        expect(component.gameName).toEqual(''); 
    });

    it('ngOninit() should call getGame() from gameService', () => {
        component.ngOnInit();
        expect(gameServiceSpy.getGame).toHaveBeenCalled();
    });

    it('ngOninit() should call displayIcons() from gameService', () => {
        component.ngOnInit();
        expect(gameServiceSpy.displayIcons).toHaveBeenCalled();
    });

    it('ngOninit() should call loading() from timeService', () => {
        const spy = spyOn(component, 'loading').and.callThrough();
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it('ngAfterViewInit() should call connect from SocketClientSerive', () => {
        component.ngAfterViewInit();
        expect(component.socket.connect).toHaveBeenCalled();
    });

    it('ngAfterViewInit() should call joinRoom from SocketClientSerive', () => {
        component.ngAfterViewInit();
        expect(socketClientServiceSpy.joinRoom).toHaveBeenCalled();
    });

    it('ngAfterViewInit() should call startTimer from timeService', () => {
        component.ngAfterViewInit();
        expect(timeServiceSpy.startTimer).toHaveBeenCalled();
    });

    it('ngAfterViewInit() should call displayIcons() from gameService', () => {
        component.ngAfterViewInit();
        expect(gameServiceSpy.displayIcons).toHaveBeenCalled();
    });

    it('ngAfterViewInit() should call setColor', () => {
        component.ngAfterViewInit();
        expect(drawserviceSpy['setColor']).toEqual('yellow');
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
