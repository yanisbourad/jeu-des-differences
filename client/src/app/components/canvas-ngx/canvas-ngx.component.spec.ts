import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as constants from '@app/configuration/const-canvas';
import { BitmapService } from '@app/services/bitmap.service';
import { CanvasHolderService } from '@app/services/canvas-holder.service';
import { DrawService } from '@app/services/draw.service';
import { CanvasNgxComponent } from './canvas-ngx.component';

describe('CanvasNgxComponent', () => {
    let component: CanvasNgxComponent;
    let fixture: ComponentFixture<CanvasNgxComponent>;
    let drawService: jasmine.SpyObj<DrawService>;
    let canvasHolderService: jasmine.SpyObj<CanvasHolderService>;
    let bitmapService: jasmine.SpyObj<BitmapService>;
    // let blobImage: Blob;
    let image: ImageBitmap;
    beforeEach(async () => {
        drawService = jasmine.createSpyObj(DrawService, ['drawImage', 'clearCanvas', 'getContext', 'clearDiff']);
        canvasHolderService = jasmine.createSpyObj(CanvasHolderService, ['setCanvas', 'setCanvasData']);
        bitmapService = jasmine.createSpyObj(BitmapService, ['handleFileSelect']);
        TestBed.configureTestingModule({
            declarations: [CanvasNgxComponent],
            providers: [
                { provide: DrawService, useValue: drawService },
                { provide: CanvasHolderService, useValue: canvasHolderService },
                { provide: BitmapService, useValue: bitmapService },
            ],
        }).compileComponents();
        bitmapService.handleFileSelect.and.returnValue(Promise.resolve(image));

        fixture = TestBed.createComponent(CanvasNgxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        drawService.getContext.and.returnValue(component.canvasDrawNative.getContext('2d') as CanvasRenderingContext2D);
        drawService.clearDiff.and.returnValue();
        // read the image file as a data URL
        component.type = canvasHolderService.originalCanvas;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', './assets/image_empty.bmp');
        xhr.responseType = 'blob';
        xhr.onload = () => {
            const blobImage = xhr.response;
            createImageBitmap(blobImage).then((bmp) => {
                image = bmp;
            });
        };
        xhr.send();
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
        expect(canvas.width).toEqual(constants.DEFAULT_WIDTH);
        expect(canvas.height).toEqual(constants.DEFAULT_HEIGHT);
    });

    it('should call bitmap service when fileSelectd', () => {
        const spy = spyOn(component, 'onFileSelected');
        // create a new event on change file selection
        const event = new Event('change');
        const file = new File([''], 'test.bmp', { type: 'image/bmp' });
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const fileList = { 0: file, length: 1, item: () => file };
        Object.defineProperty(event, 'target', { value: { files: fileList } });

        // dispatch event to the component and register spy
        component['fileUpload'].nativeElement.dispatchEvent(event);
        expect(spy).toHaveBeenCalledOnceWith(event);
    });

    it('should call bitmap service when fileSelectd', () => {
        // create a new event on change file selection
        const event = new Event('change');
        // dispatch event to the component and register spy
        component.onFileSelected(event);
        expect(bitmapService.handleFileSelect).toHaveBeenCalledOnceWith(event);
    });

    it('should loadImage when file is selected', async () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        spyOn(component, 'loadImage').and.callFake(() => {});
        // create a new event on change file selection
        bitmapService.handleFileSelect.and.returnValue(Promise.resolve(image));
        const event = new Event('change');
        const blob = await (await fetch('./assets/image_empty.bmp')).blob();
        const file = await new File([blob], 'test.bmp', { type: 'image/bmp' });
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const fileList = { 0: file, length: 1, item: () => file };
        Object.defineProperty(event, 'target', { value: { files: fileList } });
        await component.onFileSelected(event);
        // expect(spy).toHaveBeenCalled();
        expect(bitmapService.handleFileSelect).toHaveBeenCalledTimes(1);
    });

    it('should save canvas', () => {
        canvasHolderService.setCanvas.calls.reset();
        component.saveCanvas();
        const canvasData = component.canvasImageNative.getContext('2d')?.getImageData(0, 0, constants.DEFAULT_WIDTH, constants.DEFAULT_HEIGHT).data;
        const canvasDataStr = component.canvasDrawNative.toDataURL();
        if (canvasData) expect(canvasHolderService.setCanvas).toHaveBeenCalled();
        else expect(canvasHolderService.setCanvas).not.toHaveBeenCalled();

        if (canvasDataStr) expect(canvasHolderService.setCanvasData).toHaveBeenCalled();
        else expect(canvasHolderService.setCanvasData).not.toHaveBeenCalled();
    });

    it('should clear canvas', () => {
        drawService.clearCanvas.calls.reset();
        const spy = spyOn(component, 'saveCanvas');
        component.clearCanvas();
        expect(drawService.clearCanvas).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
