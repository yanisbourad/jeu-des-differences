import { ElementRef } from '@angular/core';
import { Point } from '@app/interfaces/point';
import { DrawRectangleCommand } from './draw-rectangle-command';

describe('DrawRectangleCommand', () => {
    let canvasRef: ElementRef<HTMLCanvasElement>;
    let canvasName: string;

    beforeEach(() => {
        canvasRef = new ElementRef<HTMLCanvasElement>(document.createElement('canvas'));
        canvasName = 'test-canvas';
    });

    it('should create a square correctly', () => {
        const start = { x: 10, y: 10 } as Point;
        const end = { x: 20, y: 20 } as Point;
        const color = 'red';
        const isSquare = true;
        const command = new DrawRectangleCommand(start, end, color, isSquare, canvasRef, canvasName);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(command.coords).toEqual([10, 10, 10, 10]);
    });

    it('should create a rectangle correctly', () => {
        const start = { x: 10, y: 10 } as Point;
        const end = { x: 20, y: 30 } as Point;
        const color = 'red';
        const isSquare = false;
        const command = new DrawRectangleCommand(start, end, color, isSquare, canvasRef, canvasName);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(command.coords).toEqual([10, 10, 10, 20]);
    });

    it('should save and restore rectangle data correctly', () => {
        const start = { x: 10, y: 10 } as Point;
        const end = { x: 20, y: 30 } as Point;
        const color = 'red';
        const isSquare = false;
        const command = new DrawRectangleCommand(start, end, color, isSquare, canvasRef, canvasName);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const imageData = command.ctx.getImageData(10, 10, 10, 20);

        command.do();
        command.undo();
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(command.ctx.getImageData(10, 10, 10, 20)).toEqual(imageData);
    });

    it('should not save or restore if no data is available', () => {
        const start = { x: 10, y: 10 } as Point;
        const end = { x: 5, y: 5 } as Point;
        const color = 'red';
        const isSquare = false;
        const command = new DrawRectangleCommand(start, end, color, isSquare, canvasRef, canvasName);
        command.do(false);
        expect(command.saved).toBe(false);
        const oldPointsColor = command.oldPointsColor;
        command.undo();
        expect(command.oldPointsColor).toEqual(oldPointsColor);
    });

    it('returns correct coordinates when width and height are positive', () => {
        const firstPoint = { x: 100, y: 100 };
        const lastPoint = { x: 200, y: 200 };
        const command = new DrawRectangleCommand(firstPoint, lastPoint, 'color', true, canvasRef, canvasName);
        const coords = command['getCoordsSquare'](firstPoint, lastPoint);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(coords).toEqual([100, 100, 100, 100]);
    });

    it('returns correct coordinates when width and height are negative', () => {
        const firstPoint = { x: 200, y: 200 };
        const lastPoint = { x: 100, y: 100 };
        const command = new DrawRectangleCommand(firstPoint, lastPoint, 'color', true, canvasRef, canvasName);

        const coords = command['getCoordsSquare'](firstPoint, lastPoint);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(coords).toEqual([100, 100, 100, 100]);
    });

    it('returns correct coordinates when width is negative and height is positive', () => {
        const firstPoint = { x: 200, y: 100 };
        const lastPoint = { x: 100, y: 200 };
        const command = new DrawRectangleCommand(firstPoint, lastPoint, 'color', true, canvasRef, canvasName);

        const coords = command['getCoordsSquare'](firstPoint, lastPoint);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(coords).toEqual([100, 100, 100, 100]);
    });

    it('returns correct coordinates when width is positive and height is negative', () => {
        const firstPoint = { x: 100, y: 200 };
        const lastPoint = { x: 200, y: 100 };
        const command = new DrawRectangleCommand(firstPoint, lastPoint, 'color', true, canvasRef, canvasName);

        const coords = command['getCoordsSquare'](firstPoint, lastPoint);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(coords).toEqual([100, 100, 100, 100]);
    });
});
