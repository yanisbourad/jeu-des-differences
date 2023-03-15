import { ElementRef, Injectable } from '@angular/core';
import { CommandSpecific } from '@app/classes/command-specific';
import { DrawService } from './draw.service';
@Injectable({
    providedIn: 'root',
})
export class CommandService {
    pastCommand: CommandSpecific[] = [];
    futureCommand: CommandSpecific[] = [];

    constructor(private readonly drawService: DrawService) {
        // add event listener for do undo
        document.addEventListener('keydown', (event: KeyboardEvent): void => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
                if (event.shiftKey) {
                    // Redo action
                    this.redo();
                } else {
                    // Undo action
                    this.undo();
                }
            }
        });
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
        this.pastCommand.forEach((command) => {
            command.doOnOtherCanvas(canvas, canvasName);
        });
    }

    clear(): void {
        this.pastCommand = [];
        this.futureCommand = [];
    }
}
