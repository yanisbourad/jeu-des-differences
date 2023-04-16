// import { TestBed } from '@angular/core/testing';
// import { MatDialogModule } from '@angular/material/dialog';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { RouterTestingModule } from '@angular/router/testing';
// // import { GiveUpMessagePopupComponent } from '@app/components/give-up-message-popup/give-up-message-popup.component';
// import { SocketClient } from '@app/utils/socket-client';
// import { SocketTestHelper } from '@app/utils/socket-helper';
// import { Socket } from 'socket.io-client';
// import { SocketClientService } from './socket-client.service';

// import SpyObj = jasmine.SpyObj;

// describe('SocketClientService', () => {
//     let service: SocketClientService;
//     let socketClient: SpyObj<SocketClient>;

//     beforeEach(async () => {
//         socketClient = jasmine.createSpyObj('SocketClient', ['isSocketAlive', 'connect', 'on', 'emit', 'send', 'disconnect']);
//         TestBed.configureTestingModule({
//             imports: [MatDialogModule, BrowserAnimationsModule, RouterTestingModule], // add MatDialogModule here
//             providers: [{ provide: SocketClient, useValue: socketClient }],
//         });
//         service = TestBed.inject(SocketClientService);
//         socketClient.socket = new SocketTestHelper() as unknown as Socket;
//         // eslint-disable-next-line  @typescript-eslint/no-explicit-any
//         socketClient.on.and.callFake((event: string, callback: (data: any) => void) => {
//             if (event === 'hello') {
//                 callback('Hello, world!');
//             }
//             if (event === 'message') {
//                 callback('message');
//             }
//             if (event === 'connect') {
//                 callback('connect');
//             }

//             if (event === 'serverTime') {
//                 callback(new Map([['apple', 3]]));
//             }

//             if (event === 'sendRoomName') {
//                 callback(['multi', 'string']);
//             }
//             if (event === 'message-return') {
//                 callback({ message: 'string', userName: 'string', color: 'string', pos: 'string', event: true });
//             }
//             if (event === 'gameEnded') {
//                 callback([true, 'string']);
//             }
//             if (event === 'findDifference-return') {
//                 callback({ playerName: 'string' });
//             }
//             if (event === 'feedbackDifference') {
//                 const diff = new Set([1, 2, 3]);
//                 callback(diff);
//             }
//             if (event === 'giveup-return') {
//                 callback({ playerName: 'string' });
//             }
//         });
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     it('should return socketId if socket exist', () => {
//         const socketId = 'socketId';
//         socketClient.socket.id = socketId;
//         expect(service.socketId).toEqual(socketId);
//     });

//     // it('should return empty string if socket does not exist', () => {
//     //     (service.socketId as unknown) = undefined;
//     //     expect(service.socketId).toEqual('');
//     // });

//     // test for getRoomTime
//     it('should return roomTime if roomTime exist', () => {
//         service.elapsedTimes = new Map([['apple', 3]]);
//         expect(service.getRoomTime('apple')).toEqual(3);
//     });
//     //     (service.socket as unknown) = undefined;
//     //     expect(service.socketId).toEqual('');
//     // });

//     it('should not connect to the socket if the socket is connected', () => {
//         socketClient.isSocketAlive.and.returnValue(true);
//         expect(socketClient.connect).not.toHaveBeenCalled();
//     });

//     it('should call configureBaseSocketFeatures if the socket is not connected', () => {
//         socketClient.isSocketAlive.and.returnValue(false);
//         spyOn(service, 'configureBaseSocketFeatures');
//         service.connect();
//         expect(service.configureBaseSocketFeatures).toHaveBeenCalled();
//     });

//     it('configureBaseSocketFeatures should set up all event listener on the socket client', () => {
//         service.configureBaseSocketFeatures();
//         expect(socketClient.on).toHaveBeenCalledWith('connect', jasmine.any(Function));
//         expect(socketClient.on).toHaveBeenCalledWith('hello', jasmine.any(Function));
//         expect(socketClient.on).toHaveBeenCalledWith('serverTime', jasmine.any(Function));
//         expect(socketClient.on).toHaveBeenCalledWith('sendRoomName', jasmine.any(Function));
//         expect(socketClient.on).toHaveBeenCalledWith('message-return', jasmine.any(Function));
//         expect(socketClient.on).toHaveBeenCalledWith('gameEnded', jasmine.any(Function));
//         expect(socketClient.on).toHaveBeenCalledWith('findDifference-return', jasmine.any(Function));
//         expect(socketClient.on).toHaveBeenCalledWith('feedbackDifference', jasmine.any(Function));
//         // expect(socketClient.on).toHaveBeenCalledWith('giveup-return', jasmine.any(Function));
//     });

//     it('should send a joinRoomSolo message to the socket when joining a room', () => {
//         const roomName = 'roomName';
//         service.joinRoomSolo(roomName);
//         expect(socketClient.send).toHaveBeenCalled();
//         expect(socketClient.send).toHaveBeenCalledWith('joinRoomSolo', roomName);
//     });

//     // it('should return the current server message', () => {
//     //     const message = 'Hello from the server';
//     //     service.serverMessage = message;
//     //     expect(service.getServerMessage()).toEqual(message);
//     // });

//     it('should return a roomName', () => {
//         const roomName = 'roomName';
//         service.roomName = roomName;
//         // socketClient.socket.id = roomName;
//         expect(service.getRoomName()).toEqual(roomName);
//     });

//     // it('disconnect should call stopTimer() and disconnect', () => {
//     //     service.disconnect();
//     //     expect(timeService.stopTimer).toHaveBeenCalled();
//     //     expect(socketClient.disconnect).toHaveBeenCalled();
//     // });

//     it('leaveRoom should emit leaveRoom', () => {
//         service.leaveRoom();
//         expect(socketClient.send).toHaveBeenCalled();
//         expect(socketClient.send).toHaveBeenCalledWith('leaveRoom');
//     });

//     it('findDifference should emit findDifference', () => {
//         service.findDifference({ playerName: 'string', roomName: 'string' });
//         expect(socketClient.send).toHaveBeenCalled();
//         // expect(socketClient.send).toHaveBeenCalledWith('findDifference');
//     });

//     it('sendMessage should emit sendMessage', () => {
//         service.sendMessage({ message: 'string', playerName: 'string', color: 'string', pos: 'string', gameId: 'string', event: true });
//         expect(socketClient.send).toHaveBeenCalled();
//         // expect(socketClient.send).toHaveBeenCalledWith('sendMessage');
//     });

//     it('sendGiveUp should emit sendGiveUp', () => {
//         service.sendGiveUp({ playerName: 'string', roomName: 'string' });
//         expect(socketClient.send).toHaveBeenCalled();
//         //  expect(socketClient.send).toHaveBeenCalledWith('sendGiveUp');
//     });

//     it('sendDifference should emit feedbackDifference', () => {
//         const numbers: Set<number> = new Set([1, 2, 3]);
//         service.sendDifference(numbers, 'string');
//         expect(socketClient.send).toHaveBeenCalled();
//     });

//     it('should emit sendRoomName', () => {
//         const roomName = 'BLA';
//         service.sendRoomName(roomName);
//         expect(socketClient.send).toHaveBeenCalled();
//     });

//     it('should emit sendGiveUp', () => {
//         service.sendGiveUp({ playerName: 'string', roomName: 'string' });
//         expect(socketClient.send).toHaveBeenCalled();
//     });

//     it('should emit startMultiGame', () => {
//         service.startMultiGame({ gameId: 'string', creatorName: 'string', gameName: 'string', opponentName: 'string' });
//         expect(socketClient.send).toHaveBeenCalled();
//     });

//     it('should emit gameEnded', () => {
//         service.gameEnded('blabla');
//         expect(socketClient.send).toHaveBeenCalled();
//     });

//     it('should emit stopTimer', () => {
//         service.stopTimer('blabla', 'GFDG');
//         spyOn(service, 'configureBaseSocketFeatures');
//         expect(socketClient.send).toHaveBeenCalled();
//     });

//     it('should get roomTime', () => {
//         spyOn(service, 'getRoomTime');
//         service.getRoomTime('string');
//         expect(service.getRoomTime).toHaveBeenCalled();
//     });

//     // it('should disconnect after dialog is closed', () => {
//     //     const dialog = jasmine.createSpyObj('MatDialog', ['open']);
//     //     const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
//     //     spyOn(service, 'disconnect');

//     //     service.configureBaseSocketFeatures();

//     //     expect(dialog.open).toHaveBeenCalledWith(
//     //         GiveUpMessagePopupComponent,
//     //         jasmine.objectContaining({
//     //             data: { name: 'playerName' },
//     //             disableClose: true,
//     //             width: '544px',
//     //             height: '255px',
//     //         }),
//     //     );

//     //     expect(dialogRef.afterClosed).toHaveBeenCalled();
//     //     expect(service.disconnect).toHaveBeenCalled();
//     // });
// });
