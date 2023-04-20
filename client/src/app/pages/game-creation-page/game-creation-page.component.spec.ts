import { ElementRef, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CanvasNgxComponent } from '@app/components/canvas-ngx/canvas-ngx.component';
import { DifferencePopupComponent } from '@app/components/difference-popup/difference-popup.component';
import { BitmapService } from '@app/services/bitmap/bitmap.service';
import { CanvasHolderService } from '@app/services/canvas-holder/canvas-holder.service';
import { CommandService } from '@app/services/command/command.service';
import { GameCreationPageComponent } from './game-creation-page.component';
import SpyObj = jasmine.SpyObj;

describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;
    let bitmapServiceSpy: SpyObj<BitmapService>;
    let canvasHolderServiceSpy: SpyObj<CanvasHolderService>;
    let renderer2Spy: SpyObj<Renderer2>;
    let matDialogSpy: SpyObj<MatDialog>;
    let commandServiceSpy: SpyObj<CommandService>;
    let canvasNgxComponentSpy: SpyObj<CanvasNgxComponent>;

    beforeEach(() => {
        canvasHolderServiceSpy = jasmine.createSpyObj('CanvasHolderService', ['originalCanvas', 'modifiedCanvas', 'clearCanvas', 'loadImage']);
        bitmapServiceSpy = jasmine.createSpyObj('BitmapService', ['handleFileSelect']);
        renderer2Spy = jasmine.createSpyObj('Renderer2', ['insertBefore']);
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'afterClosed']);
        commandServiceSpy = jasmine.createSpyObj('CommandService', ['do']);
        canvasNgxComponentSpy = jasmine.createSpyObj('CanvasNgxComponent', ['getCanvasDraw', 'getCanvasImage', 'loadImage']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [GameCreationPageComponent, CanvasNgxComponent, DifferencePopupComponent],
            providers: [
                { provide: BitmapService, useValue: bitmapServiceSpy },
                { provide: CanvasHolderService, useValue: canvasHolderServiceSpy },
                { provide: Renderer2, useValue: renderer2Spy },
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: CommandService, useValue: commandServiceSpy },
            ],
        });

        fixture = TestBed.createComponent(GameCreationPageComponent);
        component = fixture.componentInstance;
        // bitmapService = TestBed.inject(BitmapService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return originalCanvas from CanvasHolderService', () => {
        expect(component.originalCanvas).toBeTruthy();
    });

    it('should return modifiedCanvas from CanvasHolderService', () => {
        expect(component.modifiedCanvas).toBeTruthy();
    });

    it('should open pop up on call ', () => {
        component.openCanvas();
        expect(matDialogSpy.open).toHaveBeenCalled();
    });

    // it('should call handleFileSelect from BitmapService', () => {
    //     bitmapServiceSpy.handleFileSelect.and.returnValue(Promise.resolve({} as ImageBitmap));
    //     const can1 = spyOn(component.originalCanvasComponent, 'loadImage');
    //     const can2 = spyOn(component.modifiedCanvasComponent, 'loadImage');
    //     const e = new Event('change');
    //     component.loadImage(e);
    //     expect(can1).toHaveBeenCalledTimes(1);
    //     expect(can2).toHaveBeenCalledTimes(1);
    //     expect(bitmapServiceSpy.handleFileSelect).toHaveBeenCalledWith({} as Event);
    // });

    // leftSwapDrawing() {
    //     const command = new DrawDuplicateDrawing(
    //         this.modifiedCanvasComponent.getCanvasDraw,
    //         this.originalCanvasComponent.getCanvasDraw,
    //         this.modifiedCanvas,
    //     );
    //     this.commandService.do(command);
    // }

    it('should call leftSwapDrawing', async () => {
        commandServiceSpy.do.and.returnValue(await Promise.resolve());
        component.modifiedCanvasComponent = canvasNgxComponentSpy;
        component.originalCanvasComponent = canvasNgxComponentSpy;
        component.leftSwapDrawing();
        expect(commandServiceSpy.do).toHaveBeenCalledTimes(1);
    });

    it('should call rightSwapDrawing', async () => {
        commandServiceSpy.do.and.returnValue(await Promise.resolve());
        component.modifiedCanvasComponent = canvasNgxComponentSpy;
        component.originalCanvasComponent = canvasNgxComponentSpy;
        component.rightSwapDrawing();
        expect(commandServiceSpy.do).toHaveBeenCalledTimes(1);
    });

    // lets test that
    // swapImages(): void {
    //     const command = new DrawExchange(this.originalCanvasComponent.getCanvasImage, this.modifiedCanvasComponent.getCanvasImage, 'Exchange');
    //     this.commandService.do(command);
    // }

    // swapDrawing(): void {
    //     const command = new DrawExchange(this.originalCanvasComponent.getCanvasDraw, this.modifiedCanvasComponent.getCanvasDraw, 'Exchange');
    //     this.commandService.do(command);
    // }

    it('should call swapImages', async () => {
        commandServiceSpy.do.and.returnValue(await Promise.resolve());
        component.modifiedCanvasComponent = canvasNgxComponentSpy;
        component.originalCanvasComponent = canvasNgxComponentSpy;
        component.swapImages();
        expect(commandServiceSpy.do).toHaveBeenCalledTimes(1);
    });

    it('should call swapDrawing', async () => {
        commandServiceSpy.do.and.returnValue(await Promise.resolve());
        component.modifiedCanvasComponent = canvasNgxComponentSpy;
        component.originalCanvasComponent = canvasNgxComponentSpy;
        component.swapDrawing();
        expect(commandServiceSpy.do).toHaveBeenCalledTimes(1);
    });

    // lets test that
    // openCanvas(): void {
    //     this.dialog.open(DifferencePopupComponent, {
    //         disableClose: true,
    //         height: '480x',
    //         width: '640px',
    //     });
    // }
    // loadImage(e: Event): void {
    //     this.bitmapService.handleFileSelect(e).then((img) => {
    //         if (!img) return;
    //         this.originalCanvasComponent.loadImage(img);
    //         this.modifiedCanvasComponent.loadImage(img);
    //     });
    //     this.fileUpload.nativeElement.value = '';
    // }

    it('should call loadImage', async () => {
        const e = new Event('change');
        bitmapServiceSpy.handleFileSelect.and.returnValue(Promise.resolve({} as ImageBitmap));
        component.modifiedCanvasComponent = canvasNgxComponentSpy;
        component.originalCanvasComponent = canvasNgxComponentSpy;
        canvasNgxComponentSpy.loadImage.and.callFake((img: ImageBitmap) => {
            alert(img); // this is called
        });
        component.fileUpload = new ElementRef(document.createElement('input'));
        component.loadImage(e);
        expect(bitmapServiceSpy.handleFileSelect).toHaveBeenCalledTimes(1);
    });

    it('should not call loadImage', async () => {
        const e = new Event('change');
        bitmapServiceSpy.handleFileSelect.and.returnValue(Promise.resolve(undefined));
        component.modifiedCanvasComponent = canvasNgxComponentSpy;
        component.originalCanvasComponent = canvasNgxComponentSpy;
        canvasNgxComponentSpy.loadImage.and.callFake((img: ImageBitmap) => {
            alert(img); // this is called
        });
        component.fileUpload = new ElementRef(document.createElement('input'));
        component.loadImage(e);
        expect(bitmapServiceSpy.handleFileSelect).toHaveBeenCalledTimes(1);
        expect(canvasNgxComponentSpy.loadImage).toHaveBeenCalledTimes(0);
    });
    it('should call openCanvas when pressed on button with id=validate-btn', () => {
        component.openCanvas();
        expect(matDialogSpy.open).toHaveBeenCalledTimes(1);
    });
});
