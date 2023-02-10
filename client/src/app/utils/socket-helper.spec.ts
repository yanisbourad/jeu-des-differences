// import { SocketTestHelper } from "./socket-helper";
// import { TestBed } from '@angular/core/testing';

// describe('SocketTestHelper', () => {
//   let socket: SocketTestHelper;

//   beforeEach(() => {
//     socket = new SocketTestHelper();
//   });

//   it('should add callback to callbacks map when on is called', () => {
//     const callback = jest.fn();
//     const event = 'testEvent';

//     socket.on(event, callback);

//     expect(socket.callbacks.get(event)).toContainEqual(callback);
//   });

//   it('should call all callbacks when peerSideEmit is called', () => {
//     const event = 'testEvent';
//     const params = { test: 'params' };

//     const callback1 = jest.fn();
//     const callback2 = jest.fn();

//     socket.on(event, callback1);
//     socket.on(event, callback2);

//     socket.peerSideEmit(event, params);

//     expect(callback1).toHaveBeenCalledWith(params);
//     expect(callback2).toHaveBeenCalledWith(params);
// });
// });
