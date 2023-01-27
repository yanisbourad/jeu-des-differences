import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as constants from '@app/configuration/const-canvas';
import { CanvasNgxComponent } from './canvas-ngx.component';

describe('CanvasNgxComponent', () => {
    let component: CanvasNgxComponent;
    let fixture: ComponentFixture<CanvasNgxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CanvasNgxComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CanvasNgxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should have a canvas', () => {
        const canvas = fixture.nativeElement.querySelector('canvas');
        expect(canvas).toBeTruthy();
    });
    it('should have a canvas with the right size', () => {
        const canvas = fixture.nativeElement.querySelector('canvas');
        expect(canvas.width).toEqual(constants.defaultWidth);
        expect(canvas.height).toEqual(constants.defaultHeight);
    });
    it('should trigger the mouseHitDetection function when the mouse is clicked', () => {
        const canvas = fixture.nativeElement.querySelector('canvas');
        const spy = spyOn(component, 'mouseHitDetection');
        canvas.dispatchEvent(new MouseEvent('mousedown'));
        expect(spy).toHaveBeenCalled();
    });
    it('should trigger the mouseMoveDetection function when the mouse is moved', () => {
        const canvas = fixture.nativeElement.querySelector('canvas');
        const event = new MouseEvent('mousedown', {
            view: window,
            bubbles: true,
            cancelable: true,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            clientX: 1 + canvas.getBoundingClientRect().left,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            clientY: 1 + canvas.getBoundingClientRect().top,
        });
        canvas.dispatchEvent(event);
        const spy = spyOn(component, 'mouseMoveDetection');
        canvas.dispatchEvent(new MouseEvent('mousemove'));
        expect(spy).toHaveBeenCalled();
    });
    it('should trigger the mouseUpDetection function when the mouse is released', () => {
        const canvas = fixture.nativeElement.querySelector('canvas');
        const event = new MouseEvent('mousedown', {
            view: window,
            bubbles: true,
            cancelable: true,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            clientX: 1 + canvas.getBoundingClientRect().left,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            clientY: 1 + canvas.getBoundingClientRect().top,
        });
        canvas.dispatchEvent(event);
        const spy = spyOn(component, 'mouseUpDetection');
        canvas.dispatchEvent(new MouseEvent('mouseup'));
        expect(spy).toHaveBeenCalled();
    });
    it('should return the right point when the mouse is clicked', () => {
        const canvas = fixture.nativeElement.querySelector('canvas');
        const canvasBound = canvas.getBoundingClientRect();
        const event = new MouseEvent('mousedown', {
            view: window,
            bubbles: true,
            cancelable: true,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            clientX: 1 + canvasBound.left,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            clientY: 1 + canvasBound.top,
        });
        canvas.dispatchEvent(event);
        const x: number = event.clientX - canvasBound.left;
        const y: number = event.clientY - canvasBound.top;
        const point = component.getPoint(event);
        expect(point).toEqual({ x, y });
    });
    it('should return the undefined when clicked outside', () => {
        const canvas = fixture.nativeElement.querySelector('canvas');
        const canvasBound = canvas.getBoundingClientRect();
        const event = new MouseEvent('mousedown', {
            view: window,
            bubbles: true,
            cancelable: true,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            clientX: -canvasBound.left,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            clientY: -canvasBound.top,
        });
        canvas.dispatchEvent(event);
        const point = component.getPoint(event);
        expect(point).toEqual(undefined);
    });
    it('should do nothing when moved outside of the canvas', () => {
        const canvas = fixture.nativeElement.querySelector('canvas');
        const canvasBound = canvas.getBoundingClientRect();
        const event = new MouseEvent('mousedown', {
            view: window,
            bubbles: true,
            cancelable: true,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            clientX: 1 + canvasBound.left,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            clientY: 1 + canvasBound.top,
        });
        canvas.dispatchEvent(event);
        const event2 = new MouseEvent('mousemove', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: -canvasBound.left,
            clientY: -canvasBound.top,
        });
        const spy = spyOn(component, 'mouseMoveDetection');
        canvas.dispatchEvent(event2);
        expect(spy).toHaveBeenCalled();
    });
    it('should return the right point when the mouse is moved', () => {
        const canvas = fixture.nativeElement.querySelector('canvas');
        const canvasBound = canvas.getBoundingClientRect();
        const event = new MouseEvent('mousedown', {
            view: window,
            bubbles: true,
            cancelable: true,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            clientX: 1 + canvasBound.left,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            clientY: 1 + canvasBound.top,
        });
        canvas.dispatchEvent(event);
        const event2 = new MouseEvent('mousemove', {
            view: window,
            bubbles: true,
            cancelable: true,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            clientX: 2 + canvasBound.left,
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            clientY: 2 + canvasBound.top,
        });
        canvas.dispatchEvent(event2);
        const point = component.getPoint(event2);
        expect(point).toEqual({ x: 2, y: 2 });
        const lastPoint = component.getLastPoint();
        expect(lastPoint).toEqual({ x: 2, y: 2 });
    });

    it('should read the file when the user selects a file', () => {
        // file read from ./assets/test.bmp
        // const blob = new Blob([''], { type: 'image/bmp' });
        // const file = new File([blob], 'test.bmp', { type: 'image/bmp' });
        const spy = spyOn(component, 'onFileSelected');
        const event = new Event('change');
        const input = fixture.nativeElement.querySelector('input');
        input.dispatchEvent(event);
        expect(spy).toHaveBeenCalled();
    });
    it('should dispatch the right event when mouseUp after mouseDown', () => {
        const canvas = fixture.nativeElement.querySelector('canvas');
        const spy = spyOn(component, 'mouseUpDetection');
        component.isDrawing = true;
        canvas.addEventListener('mouseup', () => {
            component.mouseUpDetection();
        });
        canvas.dispatchEvent(new MouseEvent('mouseup'));
        expect(spy).toHaveBeenCalled();
        expect(component.isDrawing).toEqual(false);
    });
    it('should call clearCanvas when the user clicks on the clear button', () => {
        const spy = spyOn(component, 'clearCanvas');
        const button = fixture.nativeElement.querySelector('#ClearBtn');
        button.dispatchEvent(new MouseEvent('click'));
        expect(spy).toHaveBeenCalled();
        expect(component.isDrawing);
    });
});
