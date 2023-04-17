import { TestBed } from '@angular/core/testing';

import { GameHelperService } from './game-helper.service';
import { SocketClientService } from '@app/services/socket/socket-client.service';
import SpyObj = jasmine.SpyObj;
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MessageDialogComponent } from '@app/components/message-dialog/message-dialog.component';
import { of } from 'rxjs';

describe('GameHelperService', () => {
    let gameHelper: GameHelperService;
    let socketClientServiceSpy: SpyObj<SocketClientService>;
    let matDialogSpy: SpyObj<MatDialog>;
    let foundMessage: { message: string; playerName: string; color: string; pos: string; gameId: string; event: boolean };

    beforeEach(() => {
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        socketClientServiceSpy = jasmine.createSpyObj('SocketClientService', ['sendMessage']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MessageDialogComponent],
            providers: [
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: SocketClientService, useValue: socketClientServiceSpy },
            ],
            imports: [MatDialogModule],
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({});
        gameHelper = TestBed.inject(GameHelperService);
        gameHelper.playerName = 'Alice';
        gameHelper.gameName = 'game';
        gameHelper.gameType = 'double';
        gameHelper.subMessage = {
            playerName: 'Alice',
            color: 'red',
            pos: '1',
            gameId: 'game',
            event: true,
        };
        gameHelper.message = new Date().toLocaleTimeString() + ' - ' + 'Différence trouvée';
        foundMessage = { message: gameHelper.message, ...gameHelper.subMessage };
        gameHelper.gameType = 'double';
    });

    it('should be created', () => {
        expect(gameHelper).toBeTruthy();
    });

    it('getGameTime should mock and return time for seconds under 10 digit', () => {
        const time = 5;
        const result: string = gameHelper.getGameTime(time);
        expect(result).toBe('0:05');
    });

    it('getGameTime should mock and return time for seconds above 10 digit', () => {
        const time = 15;
        const result: string = gameHelper.getGameTime(time);
        expect(result).toBe('0:15');
    });

    it('getGameTime should mock and return time for minutes under 10 digit', () => {
        const time = 65;
        const result: string = gameHelper.getGameTime(time);
        expect(result).toBe('1:05');
    });

    it('getGameTime should mock and return time for minutes above 10 digit', () => {
        const time = 125;
        const result: string = gameHelper.getGameTime(time);
        expect(result).toBe('2:05');
    });

    it('displayGameEnded should open a dialog', () => {
        gameHelper.displayGameEnded({ msg: 'message', type: 'type', time: '00:00' });
        const mockDialog = matDialogSpy.open.and.returnValue({
            afterClosed: () => of(true),
        } as MatDialogRef<MessageDialogComponent>);
        expect(mockDialog).toHaveBeenCalled();
    });

    it('displayGiveUp should open a dialog', () => {
        gameHelper.displayGiveUp('message', 'type');
        const mockDialog = matDialogSpy.open.and.returnValue({
            afterClosed: () => of(true),
        } as MatDialogRef<MessageDialogComponent>);
        expect(mockDialog).toHaveBeenCalled();
    });

    it('sendFoundMessage should add player name if game type is double', () => {
        gameHelper.gameType = 'double';
        gameHelper.sendFoundMessage();
        expect(gameHelper.message).toBe(new Date().toLocaleTimeString() + ' - ' + ' Différence trouvée par Alice');
    });

    it('sendFoundMessage should send message via socket', () => {
        foundMessage.message = new Date().toLocaleTimeString() + ' - ' + ' Différence trouvée par Alice';
        gameHelper.sendFoundMessage();
        expect(socketClientServiceSpy.sendMessage).toHaveBeenCalledWith(foundMessage);
    });

    it('sendFoundMessage should return message with mine flag', () => {
        foundMessage.message = new Date().toLocaleTimeString() + ' - ' + ' Différence trouvée par Alice';
        const testResult = gameHelper.sendFoundMessage();
        expect(testResult).toEqual({ ...foundMessage, mine: true });
    });

    it('sendErrorMessage should add player name if game type is double', () => {
        gameHelper.message = new Date().toLocaleTimeString() + ' - ' + ' Erreur';
        gameHelper.gameType = 'double';
        gameHelper.sendErrorMessage();
        expect(gameHelper.message).toBe(new Date().toLocaleTimeString() + ' - ' + ' Erreur par Alice');
    });

    it('sendErrorMessage should send message via socket', () => {
        foundMessage.message = new Date().toLocaleTimeString() + ' - ' + ' Erreur par Alice';
        gameHelper.sendErrorMessage();
        expect(socketClientServiceSpy.sendMessage).toHaveBeenCalledWith(foundMessage);
    });

    it('sendErrorMessage should return message with mine flag', () => {
        foundMessage.message = new Date().toLocaleTimeString() + ' - ' + ' Erreur par Alice';
        const testResult = gameHelper.sendErrorMessage();
        expect(testResult).toEqual({ ...foundMessage, mine: true });
    });

    /** TODO: test sendWinnerMessage et globalMessage */
});
