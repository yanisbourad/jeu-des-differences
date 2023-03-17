import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GameCardHandlerService } from '@app/services/game-card-handler-service.service';
import { PlayerWaitPopupComponent } from './player-wait-popup.component';

describe('PlayerWaitPopupComponent', () => {
    let component: PlayerWaitPopupComponent;
    let fixture: ComponentFixture<PlayerWaitPopupComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<PlayerWaitPopupComponent>>;
    let gameCardHandlerServiceSpy: jasmine.SpyObj<GameCardHandlerService>;

    beforeEach(async () => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        gameCardHandlerServiceSpy = jasmine.createSpyObj('GameCardHandlerService', [
            'join',
            'getCreatorStatus',
            'getGameState',
            'getReadinessStatus',
            'toggleCreateJoin',
            'getGameCard',
            'leave',
            'startGame',
            'rejectOpponent',
            'setNewUpdate',
            'getNewUpdate',
            'resetGameVariables',
            'getLeavingState',
        ]);
        await TestBed.configureTestingModule({
            declarations: [PlayerWaitPopupComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        gameName: 'gameName',
                        gameType: 'double',
                        name: 'player',
                    },
                },
                { provide: GameCardHandlerService, useValue: gameCardHandlerServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerWaitPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should connect to the game when method called', () => {
        component.ngOnInit();
        expect(gameCardHandlerServiceSpy.join).toHaveBeenCalled();
        expect(gameCardHandlerServiceSpy.toggleCreateJoin).toHaveBeenCalled();
    });

    it('should check content for update when method called', () => {
        gameCardHandlerServiceSpy.getCreatorStatus.and.returnValue(true);
        gameCardHandlerServiceSpy.getGameState.and.returnValue('waiting');
        gameCardHandlerServiceSpy.getReadinessStatus.and.returnValue(true);
        component.game.opponentName = 'opponent';
        component.ngAfterContentChecked();
        expect(gameCardHandlerServiceSpy.toggleCreateJoin).toHaveBeenCalled();
        expect(gameCardHandlerServiceSpy.getCreatorStatus).toHaveBeenCalled();
        expect(gameCardHandlerServiceSpy.getGameState).toHaveBeenCalled();
        expect(gameCardHandlerServiceSpy.getReadinessStatus).toHaveBeenCalled();
        expect(gameCardHandlerServiceSpy.getNewUpdate).toHaveBeenCalled();
        expect(dialogRefSpy.close).toHaveBeenCalled();
        expect(component.acceptState).toBe('waiting');
    });

    it('should call for updating when new change', () => {
        gameCardHandlerServiceSpy.getCreatorStatus.and.returnValue(true);
        gameCardHandlerServiceSpy.getGameState.and.returnValue('waiting');
        gameCardHandlerServiceSpy.getReadinessStatus.and.returnValue(true);
        gameCardHandlerServiceSpy.getNewUpdate.and.returnValue(true);
        gameCardHandlerServiceSpy.getLeavingState.and.returnValue(true);
        component.ngAfterContentChecked();
        expect(gameCardHandlerServiceSpy.toggleCreateJoin).toHaveBeenCalled();
        expect(gameCardHandlerServiceSpy.setNewUpdate).toHaveBeenCalled();
        expect(gameCardHandlerServiceSpy.resetGameVariables).toHaveBeenCalled();
    });
    it('should reject the opponent when method called', () => {
        component.rejectOpponent();
        expect(gameCardHandlerServiceSpy.rejectOpponent).toHaveBeenCalled();
    });
    it('should start the game when method called', () => {
        component.startGame();
        expect(gameCardHandlerServiceSpy.startGame).toHaveBeenCalled();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });
    it('should leave the game when method called', () => {
        component.leaveGame();
        expect(gameCardHandlerServiceSpy.leave).toHaveBeenCalled();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });
});
