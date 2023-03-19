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
        // create an event of keypress on 't' then do it to document
        const event = new KeyboardEvent('keydown', { key: 't' });
        // dispatch the event to the document
        document.dispatchEvent(event);
        expect(callback).toHaveBeenCalled();
    });

    it('should handle the enter key', () => {
        const callback = jasmine.createSpy('callback');
        service.hotkeysEventListener(['Enter'], true, callback);
        // create an event of keypress on 't' then do it to document
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        // dispatch the event to the document
        document.dispatchEvent(event);
        expect(callback).toHaveBeenCalled();
    });

    it('should handle the shift key', () => {
        const callback = jasmine.createSpy('callback');
        service.hotkeysEventListener(['Shift', 't'], true, callback);
        // create an event of keypress on 't' then do it to document
        const event = new KeyboardEvent('keydown', { key: 't', shiftKey: true });
        // dispatch the event to the document
        document.dispatchEvent(event);
        expect(callback).toHaveBeenCalled();
    });

    it('should handle the ctrl key', () => {
        const callback = jasmine.createSpy('callback');
        service.hotkeysEventListener(['Ctrl', 't'], true, callback);
        // create an event of keypress on 't' then do it to document
        const event = new KeyboardEvent('keydown', { key: 't', ctrlKey: true });
        // dispatch the event to the document
        document.dispatchEvent(event);
        expect(callback).toHaveBeenCalled();
    });

    it('should handle the meta key', () => {
        const callback = jasmine.createSpy('callback');
        service.hotkeysEventListener(['Meta', 't'], true, callback);
        // create an event of keypress on 't' then do it to document
        const event = new KeyboardEvent('keydown', { key: 't', metaKey: true });
        // dispatch the event to the document
        document.dispatchEvent(event);
        expect(callback).toHaveBeenCalled();
    });

    it('should handle the ctrl and meta key', () => {
        const callback = jasmine.createSpy('callback');
        service.hotkeysEventListener(['Meta', 'Ctrl', 't'], true, callback);
        // create an event of keypress on 't' then do it to document
        const event = new KeyboardEvent('keydown', { key: 't', metaKey: true });
        // dispatch the event to the document
        document.dispatchEvent(event);
        expect(callback).toHaveBeenCalled();
    });

    it('should handle keyup', () => {
        const callback = jasmine.createSpy('callback');
        service.hotkeysEventListener(['t'], false, callback);
        // create an event of keypress on 't' then do it to document
        const event = new KeyboardEvent('keyup', { key: 't' });
        // dispatch the event to the document
        document.dispatchEvent(event);
        expect(callback).toHaveBeenCalled();
    });

    it('should not call the callback if the key is not the same', () => {
        const callback = jasmine.createSpy('callback');
        service.hotkeysEventListener(['t'], true, callback);
        // create an event of keypress on 't' then do it to document
        const event = new KeyboardEvent('keydown', { key: 'a' });
        // dispatch the event to the document
        document.dispatchEvent(event);
        expect(callback).not.toHaveBeenCalled();
    });
});
