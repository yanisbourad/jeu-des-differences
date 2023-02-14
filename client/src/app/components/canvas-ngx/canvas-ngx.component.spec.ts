import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as constants from '@app/configuration/const-canvas';
import { BitmapService } from '@app/services/bitmap.service';
import { CanvasHolderService } from '@app/services/canvas-holder.service';
import { DrawService } from '@app/services/draw.service';
import { CanvasNgxComponent } from './canvas-ngx.component';

describe('CanvasNgxComponent', () => {
    let component: CanvasNgxComponent;
    let fixture: ComponentFixture<CanvasNgxComponent>;
    let image: ImageBitmap;
    let drawService: DrawService;
    let canvasHolderService: CanvasHolderService;
    let bitmapService: BitmapService;
    let blobImage: Blob;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CanvasNgxComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CanvasNgxComponent);
        drawService = TestBed.inject(DrawService);
        canvasHolderService = TestBed.inject(CanvasHolderService);
        bitmapService = TestBed.inject(BitmapService);
        component = fixture.componentInstance;
        fixture.detectChanges();
        // read the image file as a data URL
        const xhr = new XMLHttpRequest();
        xhr.open('GET', './assets/image_empty.bmp');
        xhr.responseType = 'blob';
        xhr.onload = () => {
            blobImage = xhr.response;
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
        expect(canvas.width).toEqual(constants.defaultWidth);
        expect(canvas.height).toEqual(constants.defaultHeight);
    });
    it('should draw an image on the canvas', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn(drawService, 'drawImage');
        const spyOnSaveImage = spyOn(component, 'saveCanvas');
        component.loadImage(image);
        expect(spy).toHaveBeenCalledOnceWith(image, component['canvas'].nativeElement);
        expect(spyOnSaveImage).toHaveBeenCalled();
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
        const spy = spyOn(bitmapService, 'handleFileSelect');
        // create a new event on change file selection
        const event = new Event('change');
        const file = new File([''], 'test.bmp', { type: 'image/bmp' });
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const fileList = { 0: file, length: 1, item: () => file };
        Object.defineProperty(event, 'target', { value: { files: fileList } });

        // dispatch event to the component and register spy
        component.onFileSelected(event);
        expect(spy).toHaveBeenCalledOnceWith(event);
    });

    it('should loadImage when file is selected', () => {
        const spy = spyOn(component, 'loadImage');
        // create a new event on change file selection
        const event = new Event('change');
        const file = new File([blobImage], 'test.bmp', { type: 'image/bmp' });
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const fileList = { 0: file, length: 1, item: () => file };
        Object.defineProperty(event, 'target', { value: { files: fileList } });
        component.onFileSelected(event);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should save canvas', () => {
        const spy = spyOn(canvasHolderService, 'setCanvas');
        component.saveCanvas();
        const canvasData = component.canvasNative.getContext('2d')?.getImageData(0, 0, constants.defaultWidth, constants.defaultHeight).data;
        if (canvasData) expect(spy).toHaveBeenCalledOnceWith(canvasData, component.type);
        else expect(spy).not.toHaveBeenCalled();
    });
});
