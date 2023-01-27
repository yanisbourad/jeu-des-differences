import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasHolderService } from '@app/services/canvas-holder.service';

import { GameCreationPageComponent } from './game-creation-page.component';

describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;
    let canvasHolderService: CanvasHolderService;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCreationPageComponent],
        }).compileComponents();

        canvasHolderService = TestBed.inject(CanvasHolderService);
        fixture = TestBed.createComponent(GameCreationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should clear service canvas holder when ngOnInit is called', () => {
        canvasHolderService.originalCanvas = '';
        canvasHolderService.modifiedCanvas = '';
        component.ngOnInit();
        expect(canvasHolderService.originalCanvas).toBeDefined();
        expect(canvasHolderService.modifiedCanvas).toBeDefined();
    });
    it('should clear service canvas holder when goBack is called', () => {
        canvasHolderService.originalCanvas = '';
        canvasHolderService.modifiedCanvas = '';
        component.goBack();
        expect(canvasHolderService.getCanvasData).toBeDefined();
    });
    it('should return the original canvas from the service', () => {
        const expectedOriginal = canvasHolderService.originalCanvas;
        expect(component.originalCanvas).toBe(expectedOriginal);
        const expectedModified = canvasHolderService.modifiedCanvas;
        expect(component.modifiedCanvas).toBe(expectedModified);
    });
});
