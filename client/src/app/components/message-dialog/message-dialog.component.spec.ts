// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
// import { Router } from '@angular/router';
// import { GameService } from '@app/services/game/game.service';
// import { SocketClientService } from '@app/services/socket/socket-client.service';
// import { MessageDialogComponent } from './message-dialog.component';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import spyObj = jasmine.SpyObj;

// // class MockGameService {
// //     static playerName = 'test player';
// // }
// describe('MessageDialogComponent', () => {
//     let component: MessageDialogComponent;
//     let fixture: ComponentFixture<MessageDialogComponent>;
//     let socket: spyObj<SocketClientService>;
//     let router: spyObj<Router>;
//     let matDialogSpy: typeof MAT_DIALOG_DATA;
//     let dialogRef: jasmine.SpyObj<MatDialogRef<MessageDialogComponent>>;
//     const mockGameService = jasmine.createSpyObj(['playerName']);

//     beforeEach(async () => {
//         router = jasmine.createSpyObj('Router', ['navigate']);
//         socket = jasmine.createSpyObj('SocketClientService', ['leaveRoom', 'getRoomName', 'sendGiveUp', 'sendMessage']);
//         socket.messageList = [];
//         matDialogSpy = jasmine.createSpyObj('MatDialog', ['close']);
//         await TestBed.configureTestingModule({
//             declarations: [MessageDialogComponent],
//             imports: [MatDialogModule, HttpClientTestingModule],
//             providers: [
//                 { provide: SocketClientService, useValue: socket },
//                 { provide: MAT_DIALOG_DATA, useValue: matDialogSpy },
//                 { provide: Router, useValue: router },
//                 { provide: GameService, useValue: mockGameService },
//                 { provide: MatDialogRef, useValue: dialogRef },
//                 { provide: MAT_DIALOG_DATA, useValue: ['message', 'type', 'formatTime'] },
//             ],
//         }).compileComponents();

//         fixture = TestBed.createComponent(MessageDialogComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });
//     it('should initialize message, type and formatTime from injected data', () => {
//         expect(component.message).toEqual('message');
//         expect(component.type).toEqual('type');
//         expect(component.formatTime).toEqual('formatTime');
//     });

//     it('redirection should call navigate(), leaveRoom() and resetTimer()', () => {
//         component.redirection();
//         expect(router.navigate).toHaveBeenCalledWith(['/home']);
//     });
//     it('should call sendGiveUp and sendMessage methods of socket client service if type is giveUp', () => {
//         component.type = 'giveUp';
//         socket.getRoomName.and.returnValue('testRoom');
//         component.redirection();
//         expect(socket.sendGiveUp).toHaveBeenCalledWith({
//             playerName: mockGameService.playerName,
//             roomName: 'testRoom',
//         });
//         expect(socket.sendMessage).toHaveBeenCalled();
//     });
//     it('should call leaveRoom method on socket service and navigate to home page', () => {
//         component.redirection();
//         expect(socket.leaveRoom).toHaveBeenCalled();
//     });
// });
