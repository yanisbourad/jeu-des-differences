import { TestBed } from '@angular/core/testing';
import { Socket } from 'socket.io-client';
import { SocketClient } from './socket-client';
import { SocketTestHelper } from './socket-helper';

// from Angular socket.io exemple on gitLab
describe('SocketClientService', () => {
    let service: SocketClient;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketClient);
        service.socket = new SocketTestHelper() as unknown as Socket;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should disconnect', () => {
        const spy = spyOn(service.socket, 'disconnect');
        service.disconnect();
        expect(spy).toHaveBeenCalled();
    });

    it('isSocketAlive should return false if the socket is not defined', () => {
        (service.socket as unknown) = undefined;
        const isAlive = service.isSocketAlive();
        expect(isAlive).toBeFalsy();
    });

    it('should call socket.on with an event', () => {
        const event = 'helloWorld';
        const action = () => {
            alert('hello world');
        };
        const spy = spyOn(service.socket, 'on');
        service.on(event, action);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event, action);
    });

    it('should call emit with data when using send', () => {
        const event = 'helloWorld';
        const data = 42;
        const spy = spyOn(service.socket, 'emit');
        service.send(event, data);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event, data);
    });

    it('should call emit without data when using send if data is undefined', () => {
        const event = 'helloWorld';
        const data = undefined;
        const spy = spyOn(service.socket, 'emit');
        service.send(event, data);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event);
    });

    it('connect should be called', () => {
        const spy = spyOn(service, 'connect');
        service.connect();
        expect(spy).toHaveBeenCalled();
    });

    it('should connect to the server', () => { // failed
        const environment = { serverUrl: 'http://localhost:3000' };
        const socket = { io: jasmine.createSpy('io')};

        service.connect();

        expect(socket.io).toHaveBeenCalledWith(environment.serverUrl,  { transports: ['websocket'], upgrade: false });
    });

    it('returns undefined if the socket is not defined', () => {
        expect(service.isSocketAlive()).toBeUndefined();
      });
    
    it('returns false if the socket is defined but not connected', () => {
        service.socket.connected = false;
        expect(service.isSocketAlive()).toBe(false);
    });

    it('returns true if the socket is defined and connected', () => {
        service.socket.connected = true;
        expect(service.isSocketAlive()).toBe(true);
    });
});
