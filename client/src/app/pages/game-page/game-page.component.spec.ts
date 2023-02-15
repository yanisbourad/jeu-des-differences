import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { GameInfoComponent } from '@app/components/game-info/game-info.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import * as constants from '@app/configuration/const-canvas';
import * as constTest from '@app/configuration/const-test';
import * as constantsTime from '@app/configuration/const-time';
import { ClientTimeService } from '@app/services/client-time.service';
import { DrawService } from '@app/services/draw.service';
import { GameService } from '@app/services/game.service';
import { SocketClientService } from '@app/services/socket-client.service';
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

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let timeServiceSpy: SpyObj<ClientTimeService>;
    let gameServiceSpy: SpyObj<GameService>;
    let socketClientServiceSpy: SpyObj<SocketClientService>;
    let drawserviceSpy: SpyObj<DrawService>;
    let dialogSpy: SpyObj<MatDialog>;
    let msg: string;
    let type: string;
    let mouseEvent: MouseEvent;

    beforeEach(() => {
        mouseEvent = new MouseEvent('click', { button: 0 });
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
        };
        gameServiceSpy.gameInformation = {
            gameTitle: 'game1',
            gameMode: 'solo',
            gameDifficulty: 'facile',
            nDifferences: 1,
            nHints: 1,
            hintsPenalty: 5,
            isClassical: true,
        };
        msg = 'Êtes-vous sûr de vouloir abandonner la partie? Cette action est irréversible.';
        type = 'giveUp';
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
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
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
            panelClass: 'custom-dialog-container',
        });
    });

    it('should call displayGiveUp when giveUp is called', () => {
        const spy = spyOn(component, 'displayGiveUp').and.callThrough();
        component.giveUp();
        expect(spy).toHaveBeenCalledWith(msg, type);
    });

    it('should return the default height', () => {
        const spy = spyOnProperty(component, 'height').and.returnValue(constants.DEFAULT_HEIGHT);
        expect(component['height']).toBe(constants.DEFAULT_HEIGHT);
        expect(spy).toHaveBeenCalled();
    });

    it('should return the default width', () => {
        const spy = spyOnProperty(component, 'width').and.returnValue(constants.DEFAULT_WIDTH);
        expect(component['width']).toBe(constants.DEFAULT_WIDTH);
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
        jasmine.clock().tick(constTest.TICK_TIME);
        expect(component.getSetDifference).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it('should returns an array of sets containing the number values from the input strings', () => {
        const differencesStr = [constTest.FIRST_DIFF, constTest.SECOND_DIFF, constTest.THIRD_DIFF];

        const expectedResult = [new Set(constTest.FIRST_SET), new Set(constTest.SECOND_SET), new Set(constTest.THIRD_SET)];
        expect(component.getSetDifference(differencesStr)).toEqual(expectedResult);
    });

    it('should call drawDiff on canvas1 and canvas2', () => {
        const diff = new Set<number>();
        component.drawDifference(diff);
        expect(drawserviceSpy.drawDiff).toHaveBeenCalledWith(diff, component.canvas1.nativeElement);
        expect(drawserviceSpy.drawDiff).toHaveBeenCalledWith(diff, component.canvas2.nativeElement);
    });

    it('should call blinkDifference with canvas1 and canvas2', () => {
        component.blinkCanvas();
        expect(gameServiceSpy.blinkDifference).toHaveBeenCalledWith(component.canvas1, component.canvas2);
    });

    it('should clear the canvas after a certain time', () => {
        jasmine.clock().install();
        component.clearCanvas();
        jasmine.clock().tick(constantsTime.BLINKING_TIME);
        expect(drawserviceSpy.clearDiff).toHaveBeenCalledWith(component.canvas1.nativeElement);
        expect(drawserviceSpy.clearDiff).toHaveBeenCalledWith(component.canvas2.nativeElement);
        jasmine.clock().uninstall();
    });

    it('should play failure audio and draw word on both canvases when word is "Erreur"', () => {
        jasmine.clock().install();
        component.displayWord('Erreur');
        expect(gameServiceSpy.playFailureAudio).toHaveBeenCalled();
        expect(drawserviceSpy.drawWord).toHaveBeenCalledWith('Erreur', component.canvas1.nativeElement, component.mousePosition);
        expect(drawserviceSpy.drawWord).toHaveBeenCalledWith('Erreur', component.canvas2.nativeElement, component.mousePosition);
        jasmine.clock().tick(constantsTime.BLINKING_TIME);
        expect(component.errorPenalty).toBeFalsy();
        jasmine.clock().uninstall();
    });

    it('should play success audio, draw word on both canvases, call clickDifferencesFound and blinkCanvas when word is not "Erreur"', () => {
        component.displayWord('Test');
        expect(gameServiceSpy.playSuccessAudio).toHaveBeenCalled();
        expect(drawserviceSpy.drawWord).toHaveBeenCalledWith('Test', component.canvas1.nativeElement, component.mousePosition);
        expect(drawserviceSpy.drawWord).toHaveBeenCalledWith('Test', component.canvas2.nativeElement, component.mousePosition);
        expect(gameServiceSpy.clickDifferencesFound).toHaveBeenCalled();
    });

    it('should set errorPenalty to true and display word "Erreur" when no diff is found', () => {
        const spy = spyOn(component, 'displayWord').and.callThrough();
        component.unfoundedDifference = [];
        component.mouseHitDetect(mouseEvent);
        expect(component.errorPenalty).toBe(true);
        expect(spy).toHaveBeenCalledWith('Erreur');
    });

    it('should sets the mouse position to the event offsetX and offsetY when the left mouse button is clicked and there is no error penalty', () => {
        component.unfoundedDifference = [];
        component.mouseHitDetect(mouseEvent);
        expect(component.mousePosition).toEqual({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
    });

    it('should sets errorPenalty to true and displays the word "Erreur" when the difference is not found', () => {
        component.unfoundedDifference = [new Set([1, 2, 3])];
        const spy = spyOn(component, 'displayWord').and.callThrough();
        component.mouseHitDetect(mouseEvent);
        expect(component.errorPenalty).toBe(true);
        expect(spy).toHaveBeenCalledWith('Erreur');
    });

    it('should draws the difference, removes the difference, and displays the word "Trouvé" when difference is found', () => {
        const spyDisplayWord = spyOn(component, 'displayWord').and.callThrough();
        const spyDrawDiff = spyOn(component, 'drawDifference').and.callThrough();
        component.unfoundedDifference = [new Set([0])];
        component.mouseHitDetect(mouseEvent);
        expect(component.unfoundedDifference).toEqual([]);
        expect(spyDrawDiff).toHaveBeenCalledWith(new Set([0]));
        expect(spyDisplayWord).toHaveBeenCalledWith('Trouvé');
    });
});