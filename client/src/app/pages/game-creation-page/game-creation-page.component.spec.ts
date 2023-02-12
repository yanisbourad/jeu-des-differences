import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { CanvasNgxComponent } from '@app/components/canvas-ngx/canvas-ngx.component';
import { DifferencePopupComponent } from '@app/components/difference-popup/difference-popup.component';
import { BitmapService } from '@app/services/bitmap.service';
import { CanvasHolderService } from '@app/services/canvas-holder.service';
import { GameCreationPageComponent } from './game-creation-page.component';

describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;
    let canvasHolderService: CanvasHolderService;
    let bitmapService: BitmapService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [GameCreationPageComponent, CanvasNgxComponent, DifferencePopupComponent],
            providers: [CanvasHolderService, BitmapService],
        });

        fixture = TestBed.createComponent(GameCreationPageComponent);
        component = fixture.componentInstance;
        canvasHolderService = TestBed.inject(CanvasHolderService);
        bitmapService = TestBed.inject(BitmapService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return originalCanvas from CanvasHolderService', () => {
        expect(component.originalCanvas).toBeTruthy();
    });

    it('should return modifiedCanvas from CanvasHolderService', () => {
        spyOn(canvasHolderService, 'setCanvas');
        expect(component.modifiedCanvas).toBe('modifiedCanvas');
    });

    it('should call handleFileSelect from BitmapService', () => {
        spyOn(bitmapService, 'handleFileSelect');
        spyOn(component.originalCanvasComponent, 'loadImage');
        spyOn(component.modifiedCanvasComponent, 'loadImage');
        component.loadImage({} as Event);
        expect(bitmapService.handleFileSelect).toHaveBeenCalled();
        expect(component.originalCanvasComponent.loadImage).toHaveBeenCalled();
        expect(component.modifiedCanvasComponent.loadImage).toHaveBeenCalled();
    });
});
