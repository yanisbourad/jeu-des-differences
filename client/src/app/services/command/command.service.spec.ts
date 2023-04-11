import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CommandSpecific } from '@app/classes/command-specific';
import * as keys from '@app/configuration/const-hotkeys';
import { HotkeysService } from '@app/services/hotkeys/hotkeys.service';
import { CommandService } from './command.service';

class CommandSpecificStub extends CommandSpecific {
    // eslint-disable-next-line no-unused-vars
    do(_save: boolean): void {
        return;
    }
    undo(): void {
        return;
    }
}

describe('CommandService', () => {
    let service: CommandService;
    let hotkeysService: HotkeysService;
    let canvasRef: ElementRef<HTMLCanvasElement>;
    let command: CommandSpecificStub;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [HotkeysService, CommandService],
        });
        // create a stub for CommandSpecific
        command = new CommandSpecificStub(canvasRef, 'stub');
        hotkeysService = TestBed.inject(HotkeysService);
        service = TestBed.inject(CommandService);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('should do and undo a command', () => {
        spyOn(command, 'do');
        spyOn(command, 'undo');

        service.do(command);
        expect(command.do).toHaveBeenCalledWith(true);
        expect(service.pastCommand.length).toBe(1);

        service.undo();
        expect(command.undo).toHaveBeenCalled();
        expect(service.pastCommand.length).toBe(0);
        expect(service.futureCommand.length).toBe(1);
    });

    it('should redo a command', () => {
        spyOn(command, 'do');

        service.futureCommand.push(command);
        service.redo();
        expect(command.do).toHaveBeenCalledWith(false);
        expect(service.pastCommand.length).toBe(1);
        expect(service.futureCommand.length).toBe(0);
    });

    it('should not redo if there is no command in future', () => {
        spyOn(command, 'do');

        service.redo();
        expect(command.do).not.toHaveBeenCalled();
        expect(service.pastCommand.length).toBe(0);
        expect(service.futureCommand.length).toBe(0);
    });

    it('should not undo if there is no command in past', () => {
        spyOn(command, 'undo');

        service.undo();
        expect(command.undo).not.toHaveBeenCalled();
        expect(service.pastCommand.length).toBe(0);
        expect(service.futureCommand.length).toBe(0);
    });

    it('should clear the command history', () => {
        service.pastCommand.push(command);
        service.futureCommand.push(command);
        service.clear();

        expect(service.pastCommand.length).toBe(0);
        expect(service.futureCommand.length).toBe(0);
    });

    it('should add event listener for redo and undo', () => {
        spyOn(hotkeysService, 'hotkeysEventListener');

        service = new CommandService(hotkeysService);

        expect(hotkeysService.hotkeysEventListener).toHaveBeenCalledWith([keys.CTRL, 'z'], true, jasmine.any(Function));
        expect(hotkeysService.hotkeysEventListener).toHaveBeenCalledWith([keys.CTRL, keys.SHIFT, 'z'], true, jasmine.any(Function));
    });
});
