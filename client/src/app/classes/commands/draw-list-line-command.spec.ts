import { ElementRef } from '@angular/core';
import { DEFAULT_LINE_CAP } from '@app/configuration/const-canvas';
import { DrawListLineCommand } from './draw-list-line-command';

describe('DrawListLineCommand', () => {
    let canvas: ElementRef<HTMLCanvasElement>;
    let ctx: CanvasRenderingContext2D;
    let command: DrawListLineCommand;

    beforeEach(() => {
        canvas = new ElementRef(document.createElement('canvas'));
        ctx = canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        command = new DrawListLineCommand(
            [
                { x: 0, y: 0 },
                { x: 100, y: 100 },
                { x: 200, y: 50 },
            ],
            'red',
            5,
            canvas,
            'test-canvas',
        );
    });

    it('should create', () => {
        expect(command).toBeTruthy();
    });

    it('should draw a line on the canvas', () => {
        const spy = spyOn(ctx, 'stroke');
        command.do(true);
        expect(spy).toHaveBeenCalled();
    });

    it('should undo the line drawing', () => {
        command.do(true);
        const spy = spyOn(ctx, 'putImageData');
        command.undo();
        expect(spy).toHaveBeenCalled();
    });

    it('should not draw a line if there are less than 2 points', () => {
        const spy = spyOn(ctx, 'stroke');
        command.points = [{ x: 0, y: 0 }];
        command.do(true);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should set lineCap to DEFAULT_LINE_CAP', () => {
        command.do(true);
        expect(ctx.lineCap).toBe(DEFAULT_LINE_CAP);
    });

    it('should set strokeStyle to the specified color', () => {
        command.do(true);
        expect(ctx.strokeStyle).toBe('#ff0000');
    });

    it('should set lineWidth to the specified width', () => {
        command.do(true);
        expect(ctx.lineWidth).toBe(command.lineWidth);
    });

    it('should draw a line between each pair of points', () => {
        const spy = spyOn(ctx, 'lineTo').and.callThrough();
        command.do(true);
        expect(spy.calls.allArgs()).toEqual([
            [100, 100],
            [200, 50],
        ]);
    });
});
