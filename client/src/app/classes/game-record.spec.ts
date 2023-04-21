import { ElementRef } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { BLINKING_COUNT } from '@app/configuration/const-time';
import { Vec2 } from '@app/interfaces/vec2';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { DrawService } from '@app/services/draw/draw.service';
import { GameRecorderService } from '@app/services/game/game-recorder.service';
import { GameRecordCommand } from './game-record';

describe('GameRecordCommand', () => {
    let gameRecordCommand: GameRecordCommand;
    let gamePage: jasmine.SpyObj<GamePageComponent>;
    let gameRecordService: jasmine.SpyObj<GameRecorderService>;
    let canvas: {
        canvas0: jasmine.SpyObj<ElementRef<HTMLCanvasElement>>;
        canvas1: jasmine.SpyObj<ElementRef<HTMLCanvasElement>>;
        canvas2: jasmine.SpyObj<ElementRef<HTMLCanvasElement>>;
        canvas3: jasmine.SpyObj<ElementRef<HTMLCanvasElement>>;
    };
    const mousePosition: Vec2 = { x: 10, y: 10 };
    const word = 'Test word';
    const tickTime = 2000;
    const timout = 500;

    beforeEach(() => {
        gamePage = jasmine.createSpyObj<GamePageComponent>('GamePageComponent', ['clearCanvases']);
        gameRecordService = jasmine.createSpyObj<GameRecorderService>('GameRecorderService', ['do']);
        gameRecordService.do.and.callFake((command: GameRecordCommand) => command.do(gamePage));
        // create and add new canvas to the document
        const oneCanvas = jasmine.createSpyObj<ElementRef<HTMLCanvasElement>>('ElementRef', ['nativeElement']);
        oneCanvas.nativeElement = document.createElement('canvas');

        canvas = {
            canvas0: oneCanvas,
            canvas1: oneCanvas,
            canvas2: oneCanvas,
            canvas3: oneCanvas,
        };
        gameRecordCommand = new (class extends GameRecordCommand {
            do(component: GamePageComponent): void {
                component.clearCanvases();
            }
        })();
    });

    it('should call drawWord and playFailureAudio method when word is Erreur', () => {
        spyOn(DrawService, 'drawWord').and.callThrough();
        spyOn(gameRecordCommand, 'playFailureAudio').and.callThrough();

        gameRecordCommand.displayWord('Erreur', canvas, mousePosition);

        expect(DrawService.drawWord).toHaveBeenCalledWith('Erreur', canvas.canvas0.nativeElement, mousePosition);
        expect(DrawService.drawWord).toHaveBeenCalledWith('Erreur', canvas.canvas3.nativeElement, mousePosition);
        expect(gameRecordCommand.playFailureAudio).toHaveBeenCalled();
    });

    it('should call drawWord, playSuccessAudio, blinkDifference and clearCanvas method when word is not Erreur', async () => {
        spyOn(DrawService, 'drawWord').and.callThrough();
        spyOn(gameRecordCommand, 'playSuccessAudio').and.callThrough();
        spyOn(gameRecordCommand, 'blinkDifference').and.callThrough();
        spyOn(gameRecordCommand, 'clearCanvas').and.callThrough();

        await gameRecordCommand.displayWord(word, canvas, mousePosition);

        expect(DrawService.drawWord).toHaveBeenCalledWith(word, canvas.canvas0.nativeElement, mousePosition);
        expect(DrawService.drawWord).toHaveBeenCalledWith(word, canvas.canvas3.nativeElement, mousePosition);
        expect(gameRecordCommand.playSuccessAudio).toHaveBeenCalled();
        expect(gameRecordCommand.blinkDifference).toHaveBeenCalledWith(canvas.canvas1, canvas.canvas2);
        expect(gameRecordCommand.clearCanvas).toHaveBeenCalled();
    });

    it('should record command with game recorder service', () => {
        spyOn(gameRecordCommand, 'do').and.callThrough();
        gameRecordCommand.record(gameRecordService);
        expect(gameRecordCommand.do).toHaveBeenCalled();
    });

    it('should return the penalty time', () => {
        expect(gameRecordCommand.timePenalty).toEqual(0);
        const newValue = 10;
        gameRecordCommand.penalty = newValue;
        expect(gameRecordCommand.timePenalty).toEqual(newValue);
    });

    it('should return the time', () => {
        expect(gameRecordCommand.gameTime(0)).toBeTruthy();
        // when the time is not set it should return 0
        expect(gameRecordCommand.gameTime(NaN)).toEqual(0);
    });

    it('should blink the canvases', fakeAsync(async () => {
        const canvas1 = {
            nativeElement: document.createElement('canvas'),
        };
        const canvas2 = {
            nativeElement: document.createElement('canvas'),
        };

        spyOn(canvas1.nativeElement.style, 'setProperty').and.callThrough();
        spyOn(canvas2.nativeElement.style, 'setProperty').and.callThrough();

        await gameRecordCommand.blinkDifference(canvas1, canvas2);
        tick(tickTime);

        expect(canvas1.nativeElement.style.setProperty).toHaveBeenCalledTimes(BLINKING_COUNT);
        expect(canvas2.nativeElement.style.setProperty).toHaveBeenCalledTimes(BLINKING_COUNT);
    }));

    it('should clear the canvas', async () => {
        const canvas1 = {
            nativeElement: document.createElement('canvas'),
        };
        const canvas2 = {
            nativeElement: document.createElement('canvas'),
        };
        const spy = spyOn(DrawService, 'clearCanvas').and.callThrough();
        gameRecordCommand.clearCanvas(canvas1.nativeElement, canvas2.nativeElement);
        await new Promise((f) => setTimeout(f, timout));
        expect(spy).toHaveBeenCalled();
    });
});
