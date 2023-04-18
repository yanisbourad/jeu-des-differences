import { TestBed } from '@angular/core/testing';

import { HintsDisplayService } from './hints-display.service';
import { SocketClientService } from '@app/services/socket/socket-client.service';
import SpyObj = jasmine.SpyObj;

fdescribe('HintsDisplayService', () => {
    let hintsDisplayService: HintsDisplayService;
    let socketClientServiceSpy: SpyObj<SocketClientService>;
    let foundMessage: { message: string; playerName: string; color: string; pos: string; gameId: string; event: boolean };

    beforeEach(() => {
        socketClientServiceSpy = jasmine.createSpyObj('SocketClientService', ['sendMessage', 'getRoomName', 'modifyTime']);
        TestBed.configureTestingModule({
            providers: [{ provide: SocketClientService, useValue: socketClientServiceSpy }],
        });
        hintsDisplayService = TestBed.inject(HintsDisplayService);
        foundMessage = { message: hintsDisplayService.message, ...hintsDisplayService.subMessage };
    });

    it('should be created', () => {
        expect(hintsDisplayService).toBeTruthy();
    });

    it('setIcons should set hintsArray', () => {
        hintsDisplayService.setIcons();
        for (let i = 0; i < hintsDisplayService.totalHints; i++) {
            expect(hintsDisplayService.hintsArray[i]).toEqual(hintsDisplayService.path.hintsNotUsed);
        }
        expect(hintsDisplayService.hintsArray.length).toBe(3);
    });

    it('updateIcons should  and switch path in differenceArray ', () => {
        hintsDisplayService.updateIcons();
        expect(hintsDisplayService.hintsArray[2]).toEqual(hintsDisplayService.path.hintsUsed);
        expect(hintsDisplayService.hintsArray[1]).toEqual(hintsDisplayService.path.hintsNotUsed);
        expect(hintsDisplayService.hintsArray[0]).toEqual(hintsDisplayService.path.hintsNotUsed);
    });

    it('sendFoundMessage message should be "Indice utilisé"', () => {
        hintsDisplayService.sendHintMessage();
        expect(hintsDisplayService.message).toBe(new Date().toLocaleTimeString() + ' - ' + ' Indice utilisé');
    });

    it('sendHintMessage should send message via socket', () => {
        foundMessage.message = new Date().toLocaleTimeString() + ' - ' + ' Indice utilisé';
        hintsDisplayService.sendHintMessage();
        expect(socketClientServiceSpy.sendMessage).toHaveBeenCalledWith(foundMessage);
    });

    it('sendHintMessage should return message with mine flag', () => {
        foundMessage.message = new Date().toLocaleTimeString() + ' - ' + ' Indice utilisé';
        const testResult = hintsDisplayService.sendHintMessage();
        expect(testResult).toEqual({ ...foundMessage, mine: true });
    });

    it('modifyTime should call socketClientService.modifyTime', () => {
        hintsDisplayService.modifyTime('classic');
        expect(socketClientServiceSpy.modifyTime).toHaveBeenCalledWith('classic');
    });
});
