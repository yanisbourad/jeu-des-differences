import { ElementRef, Injectable } from '@angular/core';
import { CommandSpecific } from '@app/classes/command-specific';
import * as keys from '@app/configuration/const-hotkeys';
import { DrawService } from './draw.service';
import { HotkeysService } from './hotkeys.service';
@Injectable({
    providedIn: 'root',
})
export class CommandService {
    pastCommand: CommandSpecific[] = [];
    futureCommand: CommandSpecific[] = [];

    constructor(private readonly drawService: DrawService, private readonly hotkeysService: HotkeysService) {
        // add event listener for redo undo
        this.hotkeysService.hotkeysEventListener([keys.CTRL, 'z'], true, this.undo.bind(this));
        this.hotkeysService.hotkeysEventListener([keys.CTRL, keys.SHIFT, 'z'], true, this.redo.bind(this));
    }

    do(command: CommandSpecific): void {
        command.do(true);
        this.pastCommand.push(command);
        this.futureCommand = [];
    }

    redo(): void {
        const command = this.futureCommand.pop();
        if (!command) return;
        command.do(false);

        this.pastCommand.push(command as CommandSpecific);
    }

    undo(): void {
        const command = this.pastCommand.pop();
        if (!command) return;
        command.undo();
        this.futureCommand.push(command as CommandSpecific);
    }
    executeAllOnCanvas(canvas: ElementRef<HTMLCanvasElement>, canvasName: string): void {
        this.drawService.clearCanvas(canvas.nativeElement);

        // we will do the drawImageCommand first
        this.pastCommand
            .filter((a: CommandSpecific) => a.constructor.name === 'DrawImageCommand')
            .forEach((command) => {
                command.doOnOtherCanvas(canvas, canvasName);
            });
        this.pastCommand
            .filter((a: CommandSpecific) => a.constructor.name !== 'DrawImageCommand')
            .forEach((command) => {
                command.doOnOtherCanvas(canvas, canvasName);
            });
    }

    clear(): void {
        this.pastCommand = [];
        this.futureCommand = [];
    }
}
