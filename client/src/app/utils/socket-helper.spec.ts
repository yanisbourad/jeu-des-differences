import { SocketTestHelper } from './socket-helper';

describe('SocketTestHelper', () => {
    let socket: SocketTestHelper;

    beforeEach(() => {
        socket = new SocketTestHelper();
    });

    it('should store a callback for a given event', () => {
        const callback = (params: unknown) => ({});
        const event = '';
        socket.on('', callback);
        expect(socket.getCallbacks().has(event)).toBeTruthy();
        expect(socket.getCallbacks().get(event)).toContain(callback);
    });

    it('should store a callback for a given event', () => {
        const callback = (params: unknown) => ({});
        const event = '';
        socket.on(event, callback);
        expect(socket.getCallbacks().has(event)).toBeTruthy();
        expect(socket.getCallbacks().get(event)).toContain(callback);
    });

    it('should call the callbacks for a given event', () => {
        const callback = jasmine.createSpy();
        const event = 'test-event';
        const params = {};
        socket.on(event, callback);
        socket.peerSideEmit(event, params);
        expect(callback).toHaveBeenCalledWith(params);
    });

    it('should call the callbacks for a given event with multiple callbacks', () => {
        const callback1 = jasmine.createSpy();
        const callback2 = jasmine.createSpy();
        const event = 'test-event';
        const params = {};
        socket.on(event, callback1);
        socket.on(event, callback2);
        socket.peerSideEmit(event, params);
        expect(callback1).toHaveBeenCalledWith(params);
        expect(callback2).toHaveBeenCalledWith(params);
    });

    it('should return nothing if callback has no event', () => {
        const callback1 = (params: unknown) => ({});
        const event = 'test-event';
        const params = {};
        socket.on(event, callback1);
        socket.peerSideEmit('', params);
        const spy = spyOn(socket, 'peerSideEmit');
        const spy2 = jasmine.createSpy();
        expect(spy2).not.toHaveBeenCalledWith(params);
        expect(spy).not.toHaveBeenCalledWith('', params);
    });

    it('should return nothing when emit is called', () => {
        const result = socket.emit();
        expect(result).toBeUndefined();
    });

    it('should return nothing when disconnect is called', () => {
        const result = socket.disconnect();
        expect(result).toBeUndefined();
    });
});
