import { ElementRef } from '@angular/core';
import { DrawExchange } from './draw-exchange-drawing';

describe('DrawExchange', () => {
    let canvas1: ElementRef<HTMLCanvasElement>;
    let canvas2: ElementRef<HTMLCanvasElement>;

    beforeEach(() => {
        canvas1 = new ElementRef(document.createElement('canvas'));
        canvas2 = new ElementRef(document.createElement('canvas'));
    });

    it('should exchange canvas data', () => {
        // Set up initial canvas data
        const data =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA' +
            'AAAGCAIAAAD8GO2jAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAJ0lEQVQI12P4//8/AAX+' +
            'Av7czFnnAAAAAElFTkSuQmCC';
        const img = new Image();
        img.src = data;
        const ctx = canvas1.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        img.onload = () => ctx.drawImage(img, 0, 0);
        const data2 = canvas2.nativeElement.toDataURL();
        const data1 = canvas1.nativeElement.toDataURL();
        // Create a new DrawExchange command
        const drawExchange = new DrawExchange(canvas1, canvas2, 'test-exchange');

        // Call the "do" function to exchange the canvas data
        drawExchange.do();

        // Ensure that the canvas data was exchanged correctly
        expect(canvas1.nativeElement.toDataURL()).toEqual(data2);
        expect(canvas2.nativeElement.toDataURL()).toEqual(data1);

        // Call the "undo" function to undo the exchange
        drawExchange.undo();

        // Ensure that the canvas data was restored to its original state
        expect(canvas1.nativeElement.toDataURL()).toEqual(data1);
        expect(canvas2.nativeElement.toDataURL()).toEqual(data2);
    });
});
