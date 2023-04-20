import { AllCanvas } from '@app/interfaces/canvas-holder';
import { Vec2 } from '@app/interfaces/vec2';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { ShowNotADiffRecord } from './show-not-a-difference';

describe('ShowNotADiffRecord', () => {
    let allCanvas: AllCanvas;
    let position: Vec2;
    let component: GamePageComponent;
    let showNotADiffRecord: ShowNotADiffRecord;

    beforeEach(() => {
        allCanvas = {
            canvas1: { nativeElement: document.createElement('canvas') },
            canvas2: { nativeElement: document.createElement('canvas') },
            canvas0: { nativeElement: document.createElement('canvas') },
            canvas3: { nativeElement: document.createElement('canvas') },
        };
        position = { x: 10, y: 20 };
        component = jasmine.createSpyObj<GamePageComponent>('GamePageComponent', ['gameService']);
        component.gameService = jasmine.createSpyObj('GameService', ['startPenaltyTimer']);
        showNotADiffRecord = new ShowNotADiffRecord(allCanvas, position);
    });

    it('should start penalty timer and display error message on do', () => {
        spyOn(showNotADiffRecord, 'displayWord').and.callThrough();
        spyOn(showNotADiffRecord, 'clearCanvas').and.callThrough();
        showNotADiffRecord.do(component);

        expect(component.gameService.startPenaltyTimer).toHaveBeenCalled();
        expect(showNotADiffRecord.displayWord).toHaveBeenCalledWith('Erreur', allCanvas, position);
        expect(showNotADiffRecord.clearCanvas).toHaveBeenCalledWith(allCanvas.canvas0.nativeElement, allCanvas.canvas3.nativeElement);
    });

    it('should assigne the position to the default value if it is not given', () => {
        showNotADiffRecord = new ShowNotADiffRecord(allCanvas);
        spyOn(showNotADiffRecord, 'displayWord').and.callThrough();
        spyOn(showNotADiffRecord, 'clearCanvas').and.callThrough();
        showNotADiffRecord.do(component);

        expect(showNotADiffRecord.displayWord).toHaveBeenCalledWith('Erreur', allCanvas, { x: 0, y: 0 });
    });
});
