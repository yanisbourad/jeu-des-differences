import { TestBed } from '@angular/core/testing';

import { HotkeysService } from './hotkeys.service';

describe('HotkeysService', () => {
    let service: HotkeysService;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(HotkeysService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add an event listener', () => {
        const callback = jasmine.createSpy('callback');
        service.hotkeysEventListener(['t'], true, callback);
        const event = new KeyboardEvent('keydown', { key: 't' });
        document.dispatchEvent(event);
        expect(callback).toHaveBeenCalled();
    });

    it('should handle the enter key', () => {
        const callback = jasmine.createSpy('callback');
        service.hotkeysEventListener(['Enter'], true, callback);
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        document.dispatchEvent(event);
        expect(callback).toHaveBeenCalled();
    });

    it('should handle the shift key', () => {
        const callback = jasmine.createSpy('callback');
        service.hotkeysEventListener(['Shift', 't'], true, callback);
        const event = new KeyboardEvent('keydown', { key: 't', shiftKey: true });
        document.dispatchEvent(event);
        expect(callback).toHaveBeenCalled();
    });

    it('should handle the ctrl key', () => {
        const callback = jasmine.createSpy('callback');
        service.hotkeysEventListener(['Ctrl', 't'], true, callback);
        const event = new KeyboardEvent('keydown', { key: 't', ctrlKey: true });
        document.dispatchEvent(event);
        expect(callback).toHaveBeenCalled();
    });

    it('should handle keyup', () => {
        const callback = jasmine.createSpy('callback');
        service.hotkeysEventListener(['t'], false, callback);
        const event = new KeyboardEvent('keyup', { key: 't' });
        document.dispatchEvent(event);
        expect(callback).toHaveBeenCalled();
    });

    it('should not call the callback if the key is not the same', () => {
        const callback = jasmine.createSpy('callback');
        service.hotkeysEventListener(['t'], true, callback);
        const event = new KeyboardEvent('keydown', { key: 'a' });
        document.dispatchEvent(event);
        expect(callback).not.toHaveBeenCalled();
    });

    it('should return true if shift is pressed and keys include SHIFT', () => {
        const keys = ['Shift'];
        const event = new KeyboardEvent('keydown', { shiftKey: true });
        expect(service.handleShift(keys, event)).toBeTrue();
    });

    it('should return false if shift is pressed and keys do not include SHIFT', () => {
        const keys = [''];
        const event = new KeyboardEvent('keydown', { shiftKey: true });
        expect(service.handleShift(keys, event)).toBeFalse();
    });

    it('should return false if shift is not pressed', () => {
        const keys = ['Shift'];
        const event = new KeyboardEvent('keydown', { shiftKey: false });
        expect(service.handleShift(keys, event)).toBeFalse();
    });

    it('should return true if ctrl is pressed and keys include CTRL', () => {
        const keys = ['Ctrl'];
        const event = new KeyboardEvent('keydown', { ctrlKey: true });
        expect(service.handleCtrl(keys, event)).toBeTrue();
    });

    it('should return true if meta is pressed and keys include CTRL', () => {
        const keys = ['Ctrl'];
        const event = new KeyboardEvent('keydown', { metaKey: true });
        expect(service.handleCtrl(keys, event)).toBeTrue();
    });

    it('should return false if ctrl and meta is pressed and keys do not include CTRL', () => {
        const keys = [''];
        const event = new KeyboardEvent('keydown', { ctrlKey: true, metaKey: true });
        expect(service.handleCtrl(keys, event)).toBeFalse();
    });

    it('should return false if ctrl but not meta is pressed and keys do not include CTRL', () => {
        const keys = [''];
        const event = new KeyboardEvent('keydown', { ctrlKey: true, metaKey: false });
        expect(service.handleCtrl(keys, event)).toBeFalse();
    });

    it('should return false if meta but not ctrl is pressed and keys do not include CTRL', () => {
        const keys = [''];
        const event = new KeyboardEvent('keydown', { ctrlKey: false, metaKey: true });
        expect(service.handleCtrl(keys, event)).toBeFalse();
    });

    it('should return false if ctrl is not pressed', () => {
        const keys = ['Ctrl'];
        const event = new KeyboardEvent('keydown', { ctrlKey: false });
        expect(service.handleCtrl(keys, event)).toBeFalse();
    });

    it('should return false if meta is not pressed', () => {
        const keys = ['Ctrl'];
        const event = new KeyboardEvent('keydown', { metaKey: false });
        expect(service.handleCtrl(keys, event)).toBeFalse();
    });

    it('should call functionToCall if isKeyDown is true and keys are correct', () => {
        const keys = ['Enter'];
        const isKeyDown = true;
        const functionToCall = jasmine.createSpy('functionToCall');
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        service.hotkeysEventListener(keys, isKeyDown, functionToCall);
        document.dispatchEvent(event);
        expect(functionToCall).toHaveBeenCalled();
    });

    it('should not call functionToCall if isKeyDown is true and keys are not correct', () => {
        const keys = ['Enter'];
        const isKeyDown = true;
        const functionToCall = jasmine.createSpy('functionToCall');
        const event = new KeyboardEvent('keydown', { key: 'a' });
        service.hotkeysEventListener(keys, isKeyDown, functionToCall);
        document.dispatchEvent(event);
        expect(functionToCall).not.toHaveBeenCalled();
    });

    it('should call functionToCall if isKeyDown is false and keys are correct', () => {
        const keys = ['Enter'];
        const isKeyDown = false;
        const functionToCall = jasmine.createSpy('functionToCall');
        const event = new KeyboardEvent('keyup', { key: 'Enter' });
        service.hotkeysEventListener(keys, isKeyDown, functionToCall);
        document.dispatchEvent(event);
        expect(functionToCall).toHaveBeenCalled();
    });

    it('should not call functionToCall if isKeyDown false and keys are not correct', () => {
        const keys = ['Enter'];
        const isKeyDown = false;
        const functionToCall = jasmine.createSpy('functionToCall');
        const event = new KeyboardEvent('keyup', { key: 'a' });
        service.hotkeysEventListener(keys, isKeyDown, functionToCall);
        document.dispatchEvent(event);
        expect(functionToCall).not.toHaveBeenCalled();
    });

    it('should return undefined if id > listCallbacks.length in removeHotkeysEventListener', () => {
        expect(service.removeHotkeysEventListener(1)).toBeUndefined();
    });

    it('should remove the callback if id < listCallbacks.length in removeHotkeysEventListener and keydown', () => {
        const callback = jasmine.createSpy('callback');
        service.hotkeysEventListener(['t'], true, callback);
        service.removeHotkeysEventListener(0);
        const event = new KeyboardEvent('keydown', { key: 't' });
        document.dispatchEvent(event);
        expect(callback).not.toHaveBeenCalled();
    });

    it('should remove the callback if id < listCallbacks.length in removeHotkeysEventListener and keyup', () => {
        const callback = jasmine.createSpy('callback');
        service.hotkeysEventListener(['t'], false, callback);
        service.removeHotkeysEventListener(0);
        const event = new KeyboardEvent('keyup', { key: 't' });
        document.dispatchEvent(event);
        expect(callback).not.toHaveBeenCalled();
    });
});
