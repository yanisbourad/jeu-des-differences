import { ElementRef } from '@angular/core';
import { Point } from '@app/interfaces/point';
import { CommandSpecific } from './command-specific';

class CommandSpecificStub extends CommandSpecific {
    // eslint-disable-next-line no-unused-vars
    do(_save: boolean): void {
        return;
    }
    undo(): void {
        return;
    }
}

describe('CommandSpecific', () => {
    let command: CommandSpecific;
    let canvasElement: HTMLCanvasElement;

    beforeEach(() => {
        canvasElement = document.createElement('canvas');
        command = new CommandSpecificStub(new ElementRef(canvasElement), 'test-canvas');
    });

    it('should initialize canvas and canvasName properties', () => {
        expect(command.canvas).toBeInstanceOf(ElementRef);
        expect(command.canvas.nativeElement).toBe(canvasElement);
        expect(command.canvasName).toBe('test-canvas');
    });

    it('should return expected values', () => {
        expect(command.canvasElement).toBe(canvasElement);
        expect(command.ctx).toBeInstanceOf(CanvasRenderingContext2D);
        expect(command.width).toBe(canvasElement.width);
        expect(command.height).toBe(canvasElement.height);
    });

    it('should clear the canvas', () => {
        const context = canvasElement.getContext('2d') as CanvasRenderingContext2D;
        spyOn(context, 'clearRect');
        command.clearCanvas(new ElementRef(canvasElement));
        expect(context.clearRect).toHaveBeenCalledWith(0, 0, canvasElement.width, canvasElement.height);
    });

    it('should return a string representation of the canvas', () => {
        spyOn(canvasElement, 'toDataURL').and.returnValue('data:image/png;base64,xyz');
        const dataUrl = command.getScreenShot(new ElementRef(canvasElement));
        expect(dataUrl).toBe('data:image/png;base64,xyz');
        expect(canvasElement.toDataURL).toHaveBeenCalled();
    });

    it('should save the state of modified squares', () => {
        spyOn(command, 'getSquareList').and.returnValue([{ x: 0, y: 0 }]);
        spyOn(command, 'saveLastCanvasState');
        const oldPointsColor = command.saveLineOldColors(
            [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
            ],
            1,
        );
        expect(command.getSquareList).toHaveBeenCalled();
        expect(command.saveLastCanvasState).toHaveBeenCalledWith(0, 0, jasmine.any(Map));
        expect(oldPointsColor).toEqual(jasmine.any(Map));
    });

    it('should return a list of squares that the line is in', () => {
        const points: Point[] = [
            { x: 10, y: 10 },
            { x: 20, y: 20 },
        ];
        const lineWidth = 2;
        const result = command.getSquareList(points, lineWidth);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(result.length).toBe(4);
    });

    it('should draw an image on the canvas', async () => {
        const dataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA'; // shortened for brevity

        // Arrange
        const canvas = {
            nativeElement: document.createElement('canvas'),
        };
        const image = new Image();
        image.src = dataURL;

        // Act
        command.putsCanvasData(canvas, dataURL);

        // Assert
        const ctx = canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        const imageData = ctx.getImageData(0, 0, canvas.nativeElement.width, canvas.nativeElement.height);
        expect(imageData).toBeDefined();
    });

    it('should save and restore canvas state', () => {
        const lastCanvasState = new Map<string, ImageData>();
        const ctxSpy = spyOn(command.ctx, 'getImageData').and.returnValue({ data: [0, 1, 2, 3] } as unknown as ImageData);
        const setSpy = spyOn(lastCanvasState, 'set');

        command.saveLastCanvasState(1, 2, lastCanvasState);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(ctxSpy).toHaveBeenCalledWith(10, 20, 10, 10);
        expect(setSpy).toHaveBeenCalledWith('10,20', { data: [0, 1, 2, 3] } as unknown as ImageData);

        command.restoreLastCanvasState(lastCanvasState);
    });

    it('should restore last canvas state', () => {
        // Create a mock canvas and context
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;

        // Create a mock image data
        const imageData = new ImageData(1, 1);

        // Create a mock map with one item
        const lastCanvasState = new Map<string, ImageData>();
        lastCanvasState.set('10,10', imageData);

        // Call the function to restore the canvas state
        command.restoreLastCanvasState(lastCanvasState);

        // Expect the image data to be drawn at the correct position
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(ctx.getImageData(10, 10, 1, 1)).toEqual(imageData);
    });
});
