import { ElementRef } from '@angular/core';
import { DrawErasLineCommand } from './draw-eras-command';

describe('DrawErasLineCommand', () => {
    let canvas: ElementRef<HTMLCanvasElement>;

    beforeEach(() => {
        canvas = {
            nativeElement: document.createElement('canvas'),
        };
    });

    it('should create', () => {
        const command = new DrawErasLineCommand([], 1, canvas, 'test-canvas');
        expect(command).toBeTruthy();
    });

    it('should clear points from canvas', () => {
        const points = [
            { x: 10, y: 10 },
            { x: 20, y: 20 },
        ];
        const lineWidth = 5;
        const command = new DrawErasLineCommand(points, lineWidth, canvas, 'test-canvas');
        const ctxSpy = spyOn(command.ctx, 'clearRect');
        command.do();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(ctxSpy.calls.allArgs()).toEqual([[17.5, 17.5, 5, 5]]);
    });

    it('should restore last canvas state', () => {
        const points = [
            { x: 10, y: 10 },
            { x: 20, y: 20 },
        ];
        const lineWidth = 5;
        const command = new DrawErasLineCommand(points, lineWidth, canvas, 'test-canvas');
        const oldPointsColor = new Map<string, ImageData>();
        oldPointsColor.set('10,10', new ImageData(lineWidth, lineWidth));
        oldPointsColor.set('20,20', new ImageData(lineWidth, lineWidth));
        const restoreLastCanvasStateSpy = spyOn(command, 'restoreLastCanvasState');
        command.oldPointsColor = oldPointsColor;
        command.undo();
        expect(restoreLastCanvasStateSpy).toHaveBeenCalledWith(oldPointsColor);
    });
});
