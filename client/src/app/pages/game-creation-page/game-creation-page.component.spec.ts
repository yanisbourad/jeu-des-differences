import { Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CanvasNgxComponent } from '@app/components/canvas-ngx/canvas-ngx.component';
import { DifferencePopupComponent } from '@app/components/difference-popup/difference-popup.component';
import { BitmapService } from '@app/services/bitmap.service';
import { CanvasHolderService } from '@app/services/canvas-holder.service';
import { GameCreationPageComponent } from './game-creation-page.component';
import SpyObj = jasmine.SpyObj;

describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;
    let bitmapServiceSpy: SpyObj<BitmapService>;
    let canvasHolderServiceSpy: SpyObj<CanvasHolderService>;
    let renderer2Spy: SpyObj<Renderer2>;
    let matDialogSpy: SpyObj<MatDialog>;

    beforeEach(() => {
        canvasHolderServiceSpy = jasmine.createSpyObj('CanvasHolderService', ['originalCanvas', 'modifiedCanvas', 'clearCanvas']);
        bitmapServiceSpy = jasmine.createSpyObj('BitmapService', ['handleFileSelect']);
        renderer2Spy = jasmine.createSpyObj('Renderer2', ['insertBefore']);
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'afterClosed']);
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

    it('should call clearCanvas method from CanvasHolderService', () => {
        component.ngOnInit();
        expect(canvasHolderServiceSpy.clearCanvas).toHaveBeenCalled();
    });

    it('should swap canvas element', () => {
        component.handleSwapping('.original', '.modified');
        expect(renderer2Spy.insertBefore).toBeTruthy();
    });

    it('should swap canvas element once', () => {
        component.reposition = true;
        component.swapImages();
        expect(renderer2Spy.insertBefore).toBeTruthy();
    });
    it('should reverse swapping canvas element', () => {
        component.reposition = false;
        component.swapImages();
        expect(renderer2Spy.insertBefore).toBeTruthy();
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
});
