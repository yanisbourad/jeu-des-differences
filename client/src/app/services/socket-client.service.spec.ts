import { TestBed } from '@angular/core/testing';
import SpyObj = jasmine.SpyObj;
import { SocketClientService } from './socket-client.service';
import { ClientTimeService } from './client-time.service';
import { SocketClient } from '@app/utils/socket-client';
import { SocketTestHelper } from '@app/utils/socket-helper';
import { Socket } from 'socket.io-client';

describe('SocketClientService', () => {
    let service: SocketClientService;
    let timeService: SpyObj<ClientTimeService>;
    let socketClient: SocketClient;

    beforeEach(async () => {
        timeService = jasmine.createSpyObj('ClientTimeService', ['stopTimer']);
        socketClient = new SocketClient();
        TestBed.configureTestingModule({
            providers: [
                { provide: ClientTimeService, useValue: timeService },
                { provide: SocketClient, useValue: socketClient },
            ],
        });
        service = TestBed.inject(SocketClientService);
        service.socket = (new SocketTestHelper() as unknown) as Socket;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return socketId if socket exist', () => {
        const socketId = 'socketId';
        service.socket.id = socketId;
        expect(service.socketId).toEqual(socketId);
    });

    it('should return empty string if socket does not exist', () => {
        (service.socket as unknown) = undefined;
        expect(service.socketId).toEqual('');
    });

    it('should connect to the socket if the socket is not connected', () => {
        spyOn(socketClient, 'isSocketAlive').and.returnValue(false);
        spyOn(socketClient, 'connect');
        service.connect();
        expect(socketClient.connect).toHaveBeenCalled();
    });

    it('should not connect to the socket if the socket is connected', () => {
        spyOn(socketClient, 'isSocketAlive').and.returnValue(true);
        spyOn(socketClient, 'connect');
        expect(socketClient.connect).not.toHaveBeenCalled();
       
    });

    it('should call configureBaseSocketFeatures if the socket is connected', () => {
        spyOn(socketClient, 'isSocketAlive').and.returnValue(true);
        spyOn(service, 'configureBaseSocketFeatures');
        service.connect();
        expect(service.configureBaseSocketFeatures).toHaveBeenCalled();
    });
    it('configureBaseSocketFeatures should set up the "connect", "hello" and "message" event listener on the socket client', () => {
        const spy = spyOn(socketClient, 'on');
        service.configureBaseSocketFeatures();
        expect(spy).toHaveBeenCalled();
        expect(socketClient.on).toHaveBeenCalledWith('connect', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('hello', jasmine.any(Function));
        expect(socketClient.on).toHaveBeenCalledWith('message', jasmine.any(Function));
      });
    
    it('should not connect to the socket if the socket is connected', () => {
        spyOn(socketClient, 'isSocketAlive').and.returnValue(true);
        spyOn(socketClient, 'connect');
        service.connect();
        expect(socketClient.connect).not.toHaveBeenCalled();
    });

    it('should send a joinRoom message to the socket when joining a room', () => {
        const spy = spyOn(service.socket, 'emit');
        const roomName = 'roomName';
        service.joinRoom(roomName);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith('joinRoom', roomName);
    
      });

    it('should return the current server message', () => {
    const message = 'Hello from the server';
    service.serverMessage = message;
    expect(service.getServerMessage()).toEqual(message);
    });

    it('should return a roomName', () => {
        const roomName = 'roomName';
        service.roomName = roomName;
        expect(service.getRoomName()).toEqual(roomName);
    });

    it('disconnect should call stopTimer() and disconnect', () => {
        const spy = spyOn(service.socket, 'disconnect');
        service.disconnect();
        expect(timeService.stopTimer).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('leaveRoom should emit leaveRoom', () => {
        const spy = spyOn(service.socket, 'emit');
        service.leaveRoom();
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith('leaveRoom');
    });

    it('leaveRoom should call disconnect', () => {
        const spy = spyOn(service, 'disconnect');
        service.leaveRoom();
        expect(spy).toHaveBeenCalled();
    });

    
});
