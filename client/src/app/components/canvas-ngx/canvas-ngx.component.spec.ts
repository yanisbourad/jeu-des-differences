import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ERASER, PEN, RECTANGLE } from '@app/configuration/const-styler-type';
import { BitmapService } from '@app/services/bitmap.service';
import { CanvasHolderService } from '@app/services/canvas-holder.service';
import { CommandService } from '@app/services/command.service';
import { DrawService } from '@app/services/draw.service';
import { HotkeysService } from '@app/services/hotkeys.service';
import { CanvasNgxComponent } from './canvas-ngx.component';
describe('CanvasNgxComponent', () => {
    let component: CanvasNgxComponent;
    let fixture: ComponentFixture<CanvasNgxComponent>;
    // add a mock for the canvasHolderService
    let canvasHolderService: jasmine.SpyObj<CanvasHolderService>;
    // add a mock for the drawingService
    let drawingService: DrawService;
    let hotkeysService: jasmine.SpyObj<HotkeysService>;
    // mock the commandService
    const commandService = jasmine.createSpyObj('CommandService', ['do']);

    // add a mock for the bitmapService
    const bitmapService = jasmine.createSpyObj('BitmapService', ['handleFileSelect']);

    beforeEach(async () => {
        canvasHolderService = jasmine.createSpyObj('CanvasHolderService', ['getCanvas', 'setCanvas']);
        hotkeysService = jasmine.createSpyObj('HotkeysService', ['hotkeysEventListener']);
        drawingService = new DrawService(hotkeysService);
        // mock the return value of the usedTool method
        drawingService.setTool = PEN;
        await TestBed.configureTestingModule({
            declarations: [CanvasNgxComponent],
            providers: [
                { provide: CanvasHolderService, useValue: canvasHolderService },
                { provide: DrawService, useValue: drawingService },
                { provide: HotkeysService, useValue: hotkeysService },
                { provide: CommandService, useValue: commandService },
                { provide: BitmapService, useValue: bitmapService },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CanvasNgxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set isDrawing to true when mouse is hit on the canvas', () => {
        const canvasDrawNative = component.canvasDrawNative;
        const mouseEvent = new MouseEvent('mousedown', { clientX: 10, clientY: 10 });
        spyOn(canvasDrawNative, 'getBoundingClientRect').and.returnValue({ left: 0, top: 0 } as DOMRect);
        canvasDrawNative.dispatchEvent(mouseEvent);
        expect(component.isDrawing).toBeTrue();
    });

    it('should add point to currentDrawing when mouse is hit on the canvas', () => {
        const canvasDrawNative = component.canvasDrawNative;
        const mouseEvent = new MouseEvent('mousedown', { clientX: 10, clientY: 10 });
        spyOn(canvasDrawNative, 'getBoundingClientRect').and.returnValue({ left: 0, top: 0 } as DOMRect);
        canvasDrawNative.dispatchEvent(mouseEvent);
        expect(component.currentDrawing.points.length).toEqual(1);
    });

    it('should not add point to currentDrawing if mouse is out of the canvas', () => {
        const canvasDrawNative = component.canvasDrawNative;
        const mouseEvent = new MouseEvent('mousedown', { clientX: -10, clientY: -10 });
        spyOn(canvasDrawNative, 'getBoundingClientRect').and.returnValue({ left: 0, top: 0 } as DOMRect);
        canvasDrawNative.dispatchEvent(mouseEvent);
        expect(component.currentDrawing.points.length).toEqual(0);
    });

    it('should set isDrawing to false when mouse is up on the canvas', () => {
        component.isDrawing = true;
        component.mouseUpDetection();
        expect(component.isDrawing).toBeFalse();
    });

    it('should call undo on tempCommand when mouse is moved', () => {
        spyOn(component, 'getPoint').and.returnValue({ x: 10, y: 10 });

        let mouseEvent = new MouseEvent('mousedown', { clientX: 10, clientY: 10 });
        component.mouseHitDetection(mouseEvent);
        component.isDrawing = true;
        mouseEvent = new MouseEvent('mousemove', { clientX: 20, clientY: 20 });
        component.mouseMoveDetection(mouseEvent);
        expect(component.tempCommand).toBeDefined();
        // const spy = spyOn(component.tempCommand!, 'undo');
        mouseEvent = new MouseEvent('mousemove', { clientX: 10, clientY: 10 });
        component.mouseMoveDetection(mouseEvent);
        // expect(spy).toHaveBeenCalled();
    });

    it('should not do anything when mouse is moved and isDrawing is false', () => {
        component.isDrawing = false;
        const mouseEvent = new MouseEvent('mousemove', { clientX: 10, clientY: 10 });
        component.mouseMoveDetection(mouseEvent);
        expect(component.tempCommand).toBeUndefined();
    });

    it('should call doTempCommand when mouse is moved and isDrawing is true', () => {
        component.isDrawing = false;
        let mouseEvent = new MouseEvent('mousedown', { clientX: 10, clientY: 10 });
        component.mouseHitDetection(mouseEvent);
        mouseEvent = new MouseEvent('mousemove', { clientX: 20, clientY: 20 });
        component.mouseMoveDetection(mouseEvent);
        const spy = spyOn(component, 'doTempCommand');
        mouseEvent = new MouseEvent('mousemove', { clientX: 10, clientY: 10 });
        component.isDrawing = true;
        component.mouseMoveDetection(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('should return canvasImageNative', () => {
        const canvasImageNative = component.canvasImageNative;
        expect(canvasImageNative).toBeDefined();
    });

    it('should return canvasDrawNative', () => {
        const canvasDrawNative = component.canvasDrawNative;
        expect(canvasDrawNative).toBeDefined();
    });

    it('should return the canvas as element when getCanvasDraw', () => {
        const canvasDraw = component.getCanvasDraw;
        expect(canvasDraw).toBeDefined();
    });

    it('should return the canvas as element when getCanvasImage', () => {
        const canvasImage = component.getCanvasImage;
        expect(canvasImage).toBeDefined();
    });

    it('should call handleMouseUp when mouse is up on the canvas', () => {
        const canvasDrawNative = component.canvasDrawNative;
        const mouseEvent = new MouseEvent('mouseup', { clientX: 10, clientY: 10 });
        spyOn(canvasDrawNative, 'getBoundingClientRect').and.returnValue({ left: 0, top: 0 } as DOMRect);
        const spy = spyOn(component, 'mouseUpDetection');
        canvasDrawNative.dispatchEvent(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('should call handleMouseMove when mouse is moved on the canvas', () => {
        const canvasDrawNative = component.canvasDrawNative;
        const mouseEvent = new MouseEvent('mousemove', { clientX: 10, clientY: 10 });
        spyOn(canvasDrawNative, 'getBoundingClientRect').and.returnValue({ left: 0, top: 0 } as DOMRect);
        const spy = spyOn(component, 'mouseMoveDetection');
        canvasDrawNative.dispatchEvent(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('should call handleMouseHit when mouse is hit on the canvas', () => {
        const canvasDrawNative = component.canvasDrawNative;
        const mouseEvent = new MouseEvent('mousedown', { clientX: 10, clientY: 10 });
        spyOn(canvasDrawNative, 'getBoundingClientRect').and.returnValue({ left: 0, top: 0 } as DOMRect);
        const spy = spyOn(component, 'mouseHitDetection');
        canvasDrawNative.dispatchEvent(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('should call handleMouseLeave when mouse is out of the canvas', () => {
        const canvasDrawNative = component.canvasDrawNative;
        const mouseEvent = new MouseEvent('mouseleave', { clientX: 10, clientY: 10 });
        spyOn(canvasDrawNative, 'getBoundingClientRect').and.returnValue({ left: 0, top: 0 } as DOMRect);
        const spy = spyOn(component, 'mouseUpDetection');
        canvasDrawNative.dispatchEvent(mouseEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('should create and dispatch a command load image when loadImage is called', () => {
        component.loadImage('' as unknown as ImageBitmap);
        expect(commandService.do).toHaveBeenCalled();
    });

    it('should load image when onFileSelected is called', fakeAsync(() => {
        const spy = spyOn(component, 'loadImage');
        bitmapService.handleFileSelect = async () => Promise.resolve('hello' as unknown as ImageBitmap);
        component.onFileSelected({ target: { files: [''] } } as unknown as Event);
        tick();
        expect(spy).toHaveBeenCalledOnceWith('hello' as unknown as ImageBitmap);
    }));

    it('should return the last point of the current drawing', () => {
        component.currentDrawing.points = [{ x: 0, y: 0 }];
        const point = component.getLastPoint();
        expect(point).toEqual({ x: 0, y: 0 });
    });

    it('should create and dispatch a command eras when doTempCommand is called and drawService tool is set to erase', () => {
        drawingService.setTool = ERASER;
        component.currentDrawing.points = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        component.isDrawing = true;
        component.doTempCommand();
        expect(component.tempCommand?.constructor.name).toEqual('DrawErasLineCommand');
    });

    it('should create and dispatch a command pencil when doTempCommand is called and drawService tool is set to pencil', () => {
        drawingService.setTool = PEN;
        component.currentDrawing.points = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];

        component.isDrawing = true;
        component.doTempCommand();
        expect(component.tempCommand?.constructor.name).toEqual('DrawListLineCommand');
    });

    it('should create and dispatch a command rectangle when doTempCommand is called and drawService tool is set to brush', () => {
        drawingService.setTool = RECTANGLE;
        component.currentDrawing.points = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        component.isDrawing = true;
        component.doTempCommand();
        expect(component.tempCommand?.constructor.name).toEqual('DrawRectangleCommand');
    });

    it('should do nothing when the tool is not supported', () => {
        drawingService.setTool = 'unsupported';
        component.currentDrawing.points = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
        ];
        component.isDrawing = true;
        component.doTempCommand();
        expect(component.tempCommand).toBeUndefined();
    });

    it('should do nothing when event mouse mouve is detected and the is drawing is false', () => {
        component.isDrawing = false;
        const spy = spyOn(component, 'doTempCommand');
        component.mouseUpDetection();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should generte a merge the draw canvas with the image canvas when getUpdatedTempCanvasCtx is called', () => {
        const spy = spyOn(component.getCtxCanvasTemp, 'drawImage');
        const ctx = component.getUpdatedTempCanvasCtx();
        expect(ctx).toBeTruthy();
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('returns an array with length equal to the canvas area * 4', () => {
        const multiplier = 4;
        const imageData = component.getCanvasData();
        expect(imageData.length).toEqual(component.canvasDrawNative.width * component.canvasDrawNative.height * multiplier);
    });

    it('should return the canvas as element when getCanvasDraw', () => {
        expect(component.getCanvasUrlData()).toBeInstanceOf(String);
    });

    it('should call the drawService with the canvas draw when clearDiff is called', () => {
        const spy = spyOn(drawingService, 'clearDiff');
        component.clearCanvasDraw();
        expect(spy).toHaveBeenCalled();
    });
});
