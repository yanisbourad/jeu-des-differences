import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommandService } from '@app/services/command.service';
import { DrawService } from '@app/services/draw.service';
import { ImageDiffService } from '@app/services/image-diff.service';
import { DrawingToolBarComponent } from './drawing-tool-bar.component';
import SpyObj = jasmine.SpyObj;

describe('DrawingToolBarComponent', () => {
    let component: DrawingToolBarComponent;
    let fixture: ComponentFixture<DrawingToolBarComponent>;
    let drawServiceSpy: SpyObj<DrawService>;
    let imageDiffServiceSpy: SpyObj<ImageDiffService>;
    let commandService: CommandService;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawService', ['setLineWidth', 'setColor']);
        imageDiffServiceSpy = jasmine.createSpyObj('ImageDiffService', ['setRadius']);
        commandService = jasmine.createSpyObj('CommandService', ['do', 'undo', 'redo']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DrawingToolBarComponent],
            providers: [
                { provide: DrawService, useValue: drawServiceSpy },
                { provide: ImageDiffService, useValue: imageDiffServiceSpy },
                { provide: CommandService, useValue: commandService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DrawingToolBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call set method on service when setLineWidth is called', () => {
        component.lineWidth = 1;
        component.setLineWidth();
        expect(drawServiceSpy.setLineWidth).toEqual(1);
    });

    it('should set Color on service when setColor is called', () => {
        component.lineColor = '#000000';
        component.setLineColor();
        expect(drawServiceSpy.setColor).toEqual('#000000');
    });

    it('should set radius on service when setRadius is called', () => {
        component.selectedRadius = 1;
        component.setRadius();
        expect(imageDiffServiceSpy.setRadius).toEqual(1);
    });

    // lets test that
    // togglePencil() {
    //     this.drawingService.setTool = stylers.PEN;
    //     this.tool = 'pencil';
    // }
    // toggleRectangle() {
    //     this.drawingService.setTool = stylers.RECTANGLE;
    //     this.tool = 'rectangle';
    // }
    // toggleErase(): void {
    //     this.drawingService.setTool = stylers.ERASER;
    //     this.tool = 'erase';
    // }

    // setLineWidth(): void {
    //     this.drawingService.setLineWidth = this.lineWidth;
    // }

    // setLineColor(): void {
    //     this.drawingService.setColor = this.lineColor;
    // }

    // setRadius(): void {
    //     this.imageDifferenceService.setRadius = this.selectedRadius;
    // }

    // undo(): void {
    //     this.commandService.undo();
    // }
    // redo(): void {
    //     this.commandService.redo();
    // }

    it('should call set method on service when setLineWidth is called', () => {
        component.lineWidth = 1;
        component.setLineWidth();
        expect(drawServiceSpy.setLineWidth).toEqual(1);
    });

    it('should set Color on service when setColor is called', () => {
        component.lineColor = '#000000';
        component.setLineColor();
        expect(drawServiceSpy.setColor).toEqual('#000000');
    });

    it('should set radius on service when setRadius is called', () => {
        component.selectedRadius = 1;
        component.setRadius();
        expect(imageDiffServiceSpy.setRadius).toEqual(1);
    });

    it('should call undo on commandService when undo is called', () => {
        component.undo();
        expect(commandService.undo).toHaveBeenCalled();
    });

    it('should call redo on commandService when redo is called', () => {
        component.redo();
        expect(commandService.redo).toHaveBeenCalled();
    });

    it('should call setTool on drawingService when togglePencil is called', () => {
        component.togglePencil();
        expect(drawServiceSpy.setTool).toEqual('pen');
    });

    it('should call setTool on drawingService when toggleRectangle is called', () => {
        component.toggleRectangle();
        expect(drawServiceSpy.setTool).toEqual('rectangle');
    });

    it('should call setTool on drawingService when toggleErase is called', () => {
        component.toggleErase();
        expect(drawServiceSpy.setTool).toEqual('eraser');
    });
});
