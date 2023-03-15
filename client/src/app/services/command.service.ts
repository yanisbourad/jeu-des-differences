import { Injectable } from '@angular/core';
import { CommandSpecific } from '@app/classes/command-specific';
@Injectable({
    providedIn: 'root',
})
export class CommandService {
    pastCommand: CommandSpecific[] = [];
    futureCommand: CommandSpecific[] = [];

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
}
