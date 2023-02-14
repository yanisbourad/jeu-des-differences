import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameDatabaseService } from '@app/services/game-database.service';
import { ImageDiffService } from '@app/services/image-diff.service';
import { GameNameSaveComponent } from './game-name-save.component';
import SpyObj = jasmine.SpyObj;

describe('GameNameSaveComponent', () => {
    let component: GameNameSaveComponent;
    let fixture: ComponentFixture<GameNameSaveComponent>;

    let imageDiffServiceSpy: SpyObj<ImageDiffService>;
    let gameDatabaseServiceSpy: SpyObj<GameDatabaseService>;
    let routingSpy: SpyObj<Router>;
    let dialogSpy: SpyObj<MatDialogRef<GameNameSaveComponent>>;

    beforeEach(() => {
        imageDiffServiceSpy = jasmine.createSpyObj('ImageDiffService', ['getDifficulty']);
        gameDatabaseServiceSpy = jasmine.createSpyObj('GameDatabaseService', ['saveGame']);
        routingSpy = jasmine.createSpyObj('Router', ['navigate']);
        dialogSpy = jasmine.createSpyObj('MatDialogRef<GameNameSaveComponent>', ['close']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameNameSaveComponent],
            providers: [
                { provide: ImageDiffService, useValue: imageDiffServiceSpy },
                { provide: MatDialogRef<GameNameSaveComponent>, useValue: dialogSpy },
                { provide: Router, useValue: routingSpy },
                { provide: GameDatabaseService, useValue: gameDatabaseServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameNameSaveComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        component.gameName = '';
        component.level = '';
        component.showFeedback = '';
        component.lowerLengthNameLimit = 3;
        component.upperLengthNameLimit = 9;
        expect(component).toBeTruthy();
        expect(imageDiffServiceSpy.getDifficulty).toHaveBeenCalled();
    });

    it('should return true if the name is valid', () => {
        expect(component.validateGameName('test')).toBeTrue();
        expect(component.validateGameName('      ')).toBeFalse();
        expect(component.validateGameName('te')).toBeFalse();
        expect(component.validateGameName('VIRTUAL QUEST')).toBeFalse();
    });

    it('should communicate game name to be saved to the server on valid name', () => {
        component.gameName = 'papa';
        component.getGameData();
        expect(gameDatabaseServiceSpy.saveGame).toHaveBeenCalled();
    });

    it('should not communicate game name to be saved to the server on invalid name ', () => {
        component.gameName = '     ';
        component.getGameData();
        expect(component.showFeedback).toBe('');
    });

    it('should close pop up on call ', () => {
        component.closeOnAbort();
        expect(dialogSpy.close).toHaveBeenCalled();
        expect(component.showFeedback).toBe('');
    });
});
