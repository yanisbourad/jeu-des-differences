// import { HttpClientModule } from '@angular/common/http';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// import { ActivatedRoute } from '@angular/router';
// import { RouterTestingModule } from '@angular/router/testing';
// import { GameInfoComponent } from '@app/components/game-info/game-info.component';
// import { HeaderComponent } from '@app/components/header/header.component';
// import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
// import { TimerComponent } from '@app/components/timer/timer.component';
// import * as constants from '@app/configuration/const-canvas';
// import * as constTest from '@app/configuration/const-test';
// import * as constantsTime from '@app/configuration/const-time';
// import { DrawService } from '@app/services/draw/draw.service';
// import { GameService } from '@app/services/game/game.service';
// import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
// import { SocketClientService } from '@app/services/socket/socket-client.service';
// import { Subject } from 'rxjs';
// import { GamePageComponent } from './game-page.component';
// import SpyObj = jasmine.SpyObj;
// class ActivatedRouteMock {
//     params = { subscribe: jasmine.createSpy('subscribe') };
//     snapshot = {
//         paramMap: {
//             get: jasmine.createSpy('get').and.returnValues('defaultName', 'defaultPlayer'),
//         },
//     };
// }

// describe('GamePageComponent', () => {
//     let component: GamePageComponent;
//     let fixture: ComponentFixture<GamePageComponent>;
//     let gameServiceSpy: SpyObj<GameService>;
//     let socketClientServiceSpy: SpyObj<SocketClientService>;
//     let drawServiceSpy: SpyObj<DrawService>;
//     let dialogSpy: SpyObj<MatDialog>;
//     let hotkeySpy: SpyObj<HotkeysService>;
//     let msg: string;
//     let type: string;
//     let mouseEvent: MouseEvent;
//     let gameState: Subject<boolean>;
//     let playerFoundDiff: Subject<string>;
//     let diffFound: Subject<Set<number>>;
//     beforeEach(() => {
//         mouseEvent = new MouseEvent('click', { button: 0 });
//         gameServiceSpy = jasmine.createSpyObj('GameService', [
//             'displayIcons',
//             'playFailureAudio',
//             'playSuccessAudio',
//             'handleDifferenceFound',
//             'handlePlayerDifference',
//             'blinkDifference',
//             'getGame',
//             'displayGameEnded',
//             'getSetDifference',
//             'reinitializeGame',
//             'sendFoundMessage',
//             'sendErrorMessage',
//         ]);
//         socketClientServiceSpy = jasmine.createSpyObj('SocketClientService', [
//             'connect',
//             'joinRoomSolo',
//             'disconnect',
//             'leaveRoom',
//             'getRoomName',
//             'getRoomTime',
//             'sendRoomName',
//             'sendDifference',
//         ]);
//         gameState = new Subject<boolean>();
//         playerFoundDiff = new Subject<string>();
//         diffFound = new Subject<Set<number>>();
//         socketClientServiceSpy.gameState$ = gameState.asObservable();
//         socketClientServiceSpy.playerFoundDiff$ = playerFoundDiff.asObservable();
//         socketClientServiceSpy.diffFound$ = diffFound.asObservable();
//         hotkeySpy = jasmine.createSpyObj('HotkeysService', ['hotkeysEventListener', 'removeHotkeysEventListener']);
//         drawServiceSpy = jasmine.createSpyObj('DrawService', ['drawWord', 'drawDiff', 'clearDiff', 'setColor', 'getColor']);
//         dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
//         gameServiceSpy.game = { gameName: 'no1', difficulty: 'facile', originalImageData: '###', modifiedImageData: '###', listDifferences: [] };
//         gameServiceSpy.gameInformation = { gameTitle: 'game1', gameMode: 'solo', gameDifficulty: 'facile', nDifferences: 1 };
//         msg = 'Êtes-vous sûr de vouloir abandonner la partie? Cette action est irréversible.';
//         type = 'giveUp';
//     });

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [GamePageComponent, HeaderComponent, GameInfoComponent, TimerComponent],
//             providers: [
//                 { provide: GameService, useValue: gameServiceSpy },
//                 { provide: SocketClientService, useValue: socketClientServiceSpy },
//                 { provide: DrawService, useValue: drawServiceSpy },
//                 { provide: MatDialog, useValue: dialogSpy },
//                 { provide: ActivatedRoute, useValue: ActivatedRouteMock },
//                 { provide: HotkeysService, useValue: hotkeySpy },
//             ],
//             imports: [MatDialogModule, HttpClientModule, RouterTestingModule],
//         }).compileComponents();
//         fixture = TestBed.createComponent(GamePageComponent);
//         component = fixture.componentInstance;
//         component.route = new ActivatedRouteMock() as unknown as ActivatedRoute;
//         component.unfoundedDifference = [new Set([1, 2, 3])];
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should open a dialog with the given message and type', () => {
//         component.displayGiveUp(msg, type);
//         expect(dialogSpy.open).toHaveBeenCalledWith(MessageDialogComponent, {
//             data: [msg, type],
//             minWidth: '250px',
//             minHeight: '150px',
//             panelClass: 'custom-dialog-container',
//         });
//     });

//     it('should call displayGiveUp when giveUp is called', () => {
//         const spy = spyOn(component, 'displayGiveUp').and.callThrough();
//         component.giveUp();
//         expect(spy).toHaveBeenCalledWith(msg, type);
//     });

//     it('should draw difference and update unfoundedDifference based on newValue', () => {
//         const value = new Set([1, 2, 3]);
//         const spy = spyOn(component, 'drawDifference').and.callThrough();
//         diffFound.next(value);
//         expect(spy).toHaveBeenCalledWith(value);
//         expect(component.unfoundedDifference.length).toEqual(0);
//     });

//     it('should call displayGameEnded and disconnect when gameState change', () => {
//         gameState.next(true);
//         expect(gameServiceSpy.displayGameEnded).toHaveBeenCalled();
//         expect(socketClientServiceSpy.disconnect).toHaveBeenCalled();
//     });

//     it('should call handlePlayerDifference when playerFoundDiff change', () => {
//         gameServiceSpy.opponentName = 'player';
//         playerFoundDiff.next('player');
//         expect(gameServiceSpy.handlePlayerDifference).toHaveBeenCalled();
//     });

//     it('should return the default height', () => {
//         const spy = spyOnProperty(component, 'height').and.returnValue(constants.DEFAULT_HEIGHT);
//         expect(component['height']).toBe(constants.DEFAULT_HEIGHT);
//         expect(spy).toHaveBeenCalled();
//     });

//     it('should return the default width', () => {
//         const spy = spyOnProperty(component, 'width').and.returnValue(constants.DEFAULT_WIDTH);
//         expect(component['width']).toBe(constants.DEFAULT_WIDTH);
//         expect(spy).toHaveBeenCalled();
//     });

//     it('should call ngOnDestroy()', () => {
//         const spy = spyOn(component, 'ngOnDestroy').and.callThrough();
//         component.ngOnDestroy();
//         expect(spy).toHaveBeenCalled();
//         expect(gameServiceSpy.reinitializeGame).toHaveBeenCalled();
//     });

//     it('ngOninit() should call getGame(), getRouterParams() and loading() from gameService', () => {
//         const spyLoading = spyOn(component, 'loading').and.callThrough();
//         const spyRouterParams = spyOn(component, 'getRouterParams').and.callThrough();
//         component.ngOnInit();
//         expect(gameServiceSpy.getGame).toHaveBeenCalled();
//         expect(spyRouterParams).toHaveBeenCalled();
//         expect(spyLoading).toHaveBeenCalled();
//     });

//     it('ngAfterViewInit() should call connect from SocketClientSerive', () => {
//         gameServiceSpy.gameType = 'solo';
//         component.ngAfterViewInit();
//         expect(component.socket.connect).toHaveBeenCalled();
//     });

//     it('ngAfterViewInit() should call joinRoomSolo from SocketClientSerive', () => {
//         gameServiceSpy.gameType = 'solo';
//         component.ngAfterViewInit();
//         expect(socketClientServiceSpy.connect).toHaveBeenCalled();
//         expect(socketClientServiceSpy.joinRoomSolo).toHaveBeenCalledWith(gameServiceSpy.playerName);
//     });

//     it('ngAfterViewInit() should call displayIcons() from gameService', () => {
//         gameServiceSpy.gameType = 'double';
//         gameServiceSpy.gameId = '123';
//         gameServiceSpy.gameName = 'Test';
//         const room = gameServiceSpy.gameId + gameServiceSpy.gameName;
//         component.ngAfterViewInit();
//         expect(socketClientServiceSpy.sendRoomName).toHaveBeenCalledWith(room);
//         expect(hotkeySpy.hotkeysEventListener).toHaveBeenCalled();
//         expect(component.isCheating).toBeFalsy();
//     });

//     it('ngAfterViewInit() should call setColor', () => {
//         component.ngAfterViewInit();
//         expect(drawServiceSpy['setColor']).toEqual('yellow');
//     });

//     it('loading() should call getSetDifference()', () => {
//         jasmine.clock().install();
//         const spy = spyOn(component, 'getSetDifference').and.callThrough();
//         component.loading();
//         jasmine.clock().tick(constTest.TICK_TIME);
//         expect(spy).toHaveBeenCalled();
//         jasmine.clock().uninstall();
//     });

//     it('should returns an array of sets containing the number values from the input strings', () => {
//         const differencesStr = [constTest.FIRST_DIFF, constTest.SECOND_DIFF, constTest.THIRD_DIFF];
//         const expectedResult = [new Set(constTest.FIRST_SET), new Set(constTest.SECOND_SET), new Set(constTest.THIRD_SET)];
//         expect(component.getSetDifference(differencesStr)).toEqual(expectedResult);
//     });

//     it('should call drawDiff on canvas1 and canvas2', () => {
//         const diff = new Set<number>();
//         component.drawDifference(diff);
//         expect(drawServiceSpy.drawDiff).toHaveBeenCalledWith(diff, component.canvas1.nativeElement);
//         expect(drawServiceSpy.drawDiff).toHaveBeenCalledWith(diff, component.canvas2.nativeElement);
//     });

//     it('should call blinkDifference with canvas1 and canvas2', () => {
//         component.displayWord('Test', { x: 9.5, y: 9.5 });
//         expect(gameServiceSpy.blinkDifference).toHaveBeenCalledWith(component.canvas1, component.canvas2);
//     });

//     it('should clear the canvas after a certain time', () => {
//         jasmine.clock().install();
//         component.clearCanvas(component.canvas1.nativeElement, component.canvas2.nativeElement);
//         jasmine.clock().tick(constantsTime.BLINKING_TIME);
//         expect(drawServiceSpy.clearDiff).toHaveBeenCalledWith(component.canvas1.nativeElement);
//         expect(drawServiceSpy.clearDiff).toHaveBeenCalledWith(component.canvas2.nativeElement);
//         jasmine.clock().uninstall();
//     });

//     it('should play failure audio and draw word on both canvases when word is "Erreur"', () => {
//         jasmine.clock().install();
//         component.displayWord('Erreur', { x: 9.5, y: 9.5 });
//         expect(gameServiceSpy.playFailureAudio).toHaveBeenCalled();
//         expect(drawServiceSpy.drawWord).toHaveBeenCalledWith('Erreur', component.canvas0.nativeElement, component.mousePosition);
//         expect(drawServiceSpy.drawWord).toHaveBeenCalledWith('Erreur', component.canvas3.nativeElement, component.mousePosition);
//         jasmine.clock().tick(constantsTime.BLINKING_TIME);
//         expect(component.errorPenalty).toBeFalsy();
//         jasmine.clock().uninstall();
//     });

//     it('should play success audio, draw word on both canvases, call handleDifferenceFound and blinkCanvas when word is not "Erreur"', () => {
//         component.displayWord('Test', { x: 9.5, y: 9.5 });
//         expect(gameServiceSpy.playSuccessAudio).toHaveBeenCalled();
//         expect(drawServiceSpy.drawWord).toHaveBeenCalledWith('Test', component.canvas0.nativeElement, component.mousePosition);
//         expect(drawServiceSpy.drawWord).toHaveBeenCalledWith('Test', component.canvas3.nativeElement, component.mousePosition);
//         expect(gameServiceSpy.playSuccessAudio).toHaveBeenCalled();
//         expect(gameServiceSpy.blinkDifference).toHaveBeenCalledWith(component.canvas1, component.canvas2);
//     });

//     it('should set errorPenalty to true and display word "Erreur" when no diff is found', () => {
//         const spy = spyOn(component, 'displayWord').and.callThrough();
//         component.unfoundedDifference = [];
//         component.mouseHitDetect(mouseEvent);
//         expect(component.errorPenalty).toBe(true);
//         expect(spy).toHaveBeenCalledWith('Erreur', { x: mouseEvent.offsetX, y: mouseEvent.offsetY });
//     });

//     it('should sets the mouse position to the event offsetX and offsetY when the left mouse button is clicked and there is no error penalty', () => {
//         component.unfoundedDifference = [];
//         component.mouseHitDetect(mouseEvent);
//         expect(component.mousePosition).toEqual({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
//     });

//     it('should sets errorPenalty to true and displays the word "Erreur" when the difference is not found', () => {
//         component.unfoundedDifference = [new Set([1, 2, 3])];
//         const spy = spyOn(component, 'displayWord').and.callThrough();
//         component.mouseHitDetect(mouseEvent);
//         expect(component.errorPenalty).toBe(true);
//         expect(spy).toHaveBeenCalledWith('Erreur', { x: mouseEvent.offsetX, y: mouseEvent.offsetY });
//     });

//     it('should draws the difference, removes the difference, and displays the word "Trouvé" when difference is found', () => {
//         const spyDisplayWord = spyOn(component, 'displayWord').and.callThrough();
//         const spyDrawDiff = spyOn(component, 'drawDifference').and.callThrough();
//         component.unfoundedDifference = [new Set([0])];
//         component.mouseHitDetect(mouseEvent);
//         expect(component.unfoundedDifference).toEqual([]);
//         expect(spyDrawDiff).toHaveBeenCalledWith(new Set([0]));
//         expect(spyDisplayWord).toHaveBeenCalledWith('Trouvé', { x: mouseEvent.offsetX, y: mouseEvent.offsetY });
//     });

//     it('should toggle isCheating when toggleCheating is called', () => {
//         component.isCheating = false;
//         component.toggleCheating();
//         expect(component.isCheating).toBe(true);
//         component.toggleCheating();
//         expect(component.isCheating).toBe(false);
//     });

//     it('should call drawDiff on canvasCheat0 and canvasCheat1', () => {
//         const diff = new Set<number>();
//         component.drawDifference(diff, 'black', true);
//         expect(drawServiceSpy.drawDiff).toHaveBeenCalledWith(diff, component.canvasCheat0.nativeElement);
//         expect(drawServiceSpy.drawDiff).toHaveBeenCalledWith(diff, component.canvasCheat1.nativeElement);
//     });

//     it('should call inside setInterval drawDifference when cheatMode is called and setColor is black', () => {
//         const drawDifferenceSpy = spyOn(component, 'drawDifference').and.callThrough();
//         jasmine.clock().install();
//         component.unfoundedDifference = [new Set([1, 2, 3])];
//         component.cheatMode();
//         jasmine.clock().tick(constantsTime.BLINKING_TIME);
//         expect(drawServiceSpy.setColor).toEqual('black');
//         for (const set of component.unfoundedDifference) {
//             expect(drawDifferenceSpy).toHaveBeenCalledWith(set, 'black', true);
//         }
//         jasmine.clock().uninstall();
//     });

//     it('should return true if sets are equal', () => {
//         const set1 = new Set([1, 2, 3]);
//         const set2 = new Set([3, 2, 1]);
//         expect(component.eqSet(set1, set2)).toBe(true);
//     });

//     it('should return false if sets are not equal', () => {
//         const set1 = new Set([1, 2, 3]);
//         const set2 = new Set([0, 0, 0]);
//         expect(component.eqSet(set1, set2)).toBe(false);
//     });

//     it('should return false if sets are different sizes', () => {
//         const set1 = new Set([1, 2, 3]);
//         const set2 = new Set([1, 2]);
//         expect(component.eqSet(set1, set2)).toBe(false);
//     });
// });
