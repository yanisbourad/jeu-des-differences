import { TestBed } from '@angular/core/testing';
import { SocketClientService } from './socket-client.service';
import { ClientTimeService } from './client-time.service';
import { SocketClient } from '@app/utils/socket-client';
import { SocketTestHelper } from '@app/utils/socket-helper';
import { Socket } from 'socket.io-client';
import SpyObj = jasmine.SpyObj;

describe('SocketClientService', () => {
    let service: SocketClientService;
    let timeService: SpyObj<ClientTimeService>;
    let socketClient: SpyObj<SocketClient>;

    beforeEach(async () => {
        timeService = jasmine.createSpyObj('ClientTimeService', ['stopTimer']);
        socketClient = jasmine.createSpyObj('SocketClient', [
            'isSocketAlive',
            'connect',
            'on',
            'emit',
            'send',
            'disconnect'
        ]);
        TestBed.configureTestingModule({
            providers: [
                { provide: ClientTimeService, useValue: timeService },
                { provide: SocketClient, useValue: socketClient },
            ],
        });
        service = TestBed.inject(SocketClientService);
        socketClient.socket = new SocketTestHelper() as unknown as Socket;
        socketClient.on.and.callFake(
            (event: string, callback: (data: any) => void) => {
                if (event === 'hello') {
                    callback('Hello, world!');
                }
                if(event === 'message')
                {
                    callback('message');
                }
                if(event === 'connect')
                {
                    callback('connect');
                }
            }
        ) 
       
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return socketId if socket exist', () => {
        const socketId = 'socketId';
        socketClient.socket.id = socketId;
        expect(service.socketId).toEqual(socketId);
    });

    it('should return empty string if socket does not exist', () => {
        (service.socket as unknown) = undefined;
        expect(service.socketId).toEqual('');
    });

    it('should connect to the socket if the socket is not connected', () => {
        service.connect();
        expect(socketClient.connect).toHaveBeenCalled();
    });

    it('should not connect to the socket if the socket is connected', () => {
        socketClient.isSocketAlive.and.returnValue(true);
        expect(socketClient.connect).not.toHaveBeenCalled();
    });

    it('should call configureBaseSocketFeatures if the socket is not connected', () => {
        socketClient.isSocketAlive.and.returnValue(false);
        spyOn(service, 'configureBaseSocketFeatures');
        service.connect();
        expect(service.configureBaseSocketFeatures).toHaveBeenCalled();
    });

    it('configureBaseSocketFeatures should set up the "connect", "hello" and "message" event listener on the socket client', () => {
        service.configureBaseSocketFeatures();
        expect(socketClient.on).toHaveBeenCalledWith('connect', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('hello', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('message', jasmine.any(Function));
    });

    it('should send a joinRoom message to the socket when joining a room', () => {
        const roomName = 'roomName';
        service.joinRoom(roomName);
        expect(socketClient.send).toHaveBeenCalled();
        expect(socketClient.send).toHaveBeenCalledWith('joinRoom', roomName);
    });

    it('should return the current server message', () => {
        const message = 'Hello from the server';
        service.serverMessage = message;
        expect(service.getServerMessage()).toEqual(message);
    });

    it('should return a roomName', () => {
        const roomName = 'roomName';
        socketClient.socket.id = roomName
        expect(service.getRoomName()).toEqual(roomName);
    });

    it('disconnect should call stopTimer() and disconnect', () => {
        service.disconnect();
        expect(timeService.stopTimer).toHaveBeenCalled();
        expect(socketClient.disconnect).toHaveBeenCalled();
    });

    it('leaveRoom should emit leaveRoom', () => {
        service.leaveRoom();
        expect(socketClient.send).toHaveBeenCalled();
        expect(socketClient.send).toHaveBeenCalledWith('leaveRoom')
    });
});
