import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameInfo } from '@common/game';
// eslint-disable-next-line no-restricted-imports
import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { NamePopupComponent } from '@app/components/name-popup/name-popup.component';
import { GameCardComponent } from './game-card.component';
// import { DebugElement } from '@angular/core';
// import { of } from 'rxjs';
// import { GameDatabaseService } from '@app/services/game-database.service';
import { of } from 'rxjs';
describe('GameCardComponent', () => {
    let component: GameCardComponent;
    let fixture: ComponentFixture<GameCardComponent>;
    // let gameDatabaseService: GameDatabaseService;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCardComponent, NamePopupComponent],
            imports: [MatDialogModule, RouterTestingModule, BrowserAnimationsModule, HttpClientModule],
            providers: [{ provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }],
        }).compileComponents();
        fixture = TestBed.createComponent(GameCardComponent);
        component = fixture.componentInstance;
        component.card = {
            gameName: 'difference 1',
            difficulty: 'Facile',
            originalImageData: 'imageOriginal1',
            modifiedImageData: 'imageModifie1',
            listDifferences: ['diffrence 1', 'difference 2'],
            rankingMulti: [
                {
                    gameName: 'difference 1',
                    typeGame: 'multi',
                    time: '1:23',
                    playerName: 'joueur 1',
                    dateStart: '2023-01-01',
                },
                {
                    gameName: 'difference 1',
                    typeGame: 'multi',
                    time: '1:24',
                    playerName: 'joueur 1',
                    dateStart: '2023-01-01',
                },
                {
                    gameName: 'difference 1',
                    typeGame: 'multi',
                    time: '1:25',
                    playerName: 'joueur 1',
                    dateStart: '2023-01-01',
                },
            ],
            rankingSolo: [
                {
                    gameName: 'difference 2',
                    typeGame: 'solo',
                    time: '2:34',
                    playerName: 'joueur 2',
                    dateStart: '2023-02-02',
                },
                {
                    gameName: 'difference 2',
                    typeGame: 'solo',
                    time: '2:34',
                    playerName: 'joueur 2',
                    dateStart: '2023-02-02',
                },
                {
                    gameName: 'difference 2',
                    typeGame: 'mlyi',
                    time: '2:34',
                    playerName: 'joueur 2',
                    dateStart: '2023-02-02',
                },
            ],
        } as GameInfo;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should open dialog', () => {
        const spy = spyOn(component.dialog, 'open').and.callThrough();
        component.openDialog();
        expect(spy).toHaveBeenCalledWith(NamePopupComponent, {
            data: { name: undefined, gameName: 'difference 1', gameType: 'solo' },
            disableClose: true,
        });
    });
    it('should open dialog calling launchDialog for 1v1', () => {
        const spy = spyOn(component.dialog, 'open').and.callThrough();
        component.launchDialog();
        expect(spy).toHaveBeenCalledWith(NamePopupComponent, {
            data: { name: undefined, gameName: 'difference 1', gameType: 'double' },
            disableClose: true,
        });
    });

    it('should change button text to "Classique" when on classique page', () => {
        component.url = '/classique';
        const type = component.changeButton();
        expect(type).toEqual('Classique');
    });
    it('should change button text to "Configuration" when on configuration page', () => {
        component.url = '/config';

        const type = component.changeButton();
        expect(type).toEqual('Configuration');
    });
    it('should display the difficutly', () => {
        const p = fixture.nativeElement;
        expect(p.querySelector('#gameDifficulty').textContent).toContain('Difficulté: Facile');
    });
    it('should display the name of the game', () => {
        const p = fixture.nativeElement;
        expect(p.querySelector('#gameName').textContent).toContain('difference 1');
    });
    it('should display the first one for solo game', () => {
        const firstRanking = fixture.nativeElement;
        expect(firstRanking.querySelector('#firstSolo').textContent).toContain('2:34 joueur 2');
    });
    it('should display the first one for multi game', () => {
        const firstRanking = fixture.nativeElement;
        expect(firstRanking.querySelector('#firstMulti').textContent).toContain('1:23 joueur 1');
    });

    // it('should call onDelete() on delete click', () => {
    //     spyOn(component, 'onDelete');
    //     const deleteButton: DebugElement = fixture.debugElement.query(By.css('.deleteButton'));
    //     deleteButton.triggerEventHandler('click', null);
    //     expect(component.onDelete).toHaveBeenCalled();
    // });

    it('should emit gameDeleted event when onDelete is called', fakeAsync(() => {
        component.card = {
            gameName: 'difference 1',
            difficulty: 'Facile',
            originalImageData: 'imageOriginal1',
            modifiedImageData: 'imageModifie1',
            listDifferences: ['diffrence 1', 'difference 2'],
            rankingMulti: [
                {
                    gameName: 'difference 1',
                    typeGame: 'multi',
                    time: '1:23',
                    playerName: 'joueur 1',
                    dateStart: '2023-01-01',
                },
                {
                    gameName: 'difference 1',
                    typeGame: 'multi',
                    time: '1:24',
                    playerName: 'joueur 1',
                    dateStart: '2023-01-01',
                },
                {
                    gameName: 'difference 1',
                    typeGame: 'multi',
                    time: '1:25',
                    playerName: 'joueur 1',
                    dateStart: '2023-01-01',
                },
            ],
            rankingSolo: [
                {
                    gameName: 'difference 2',
                    typeGame: 'solo',
                    time: '2:34',
                    playerName: 'joueur 2',
                    dateStart: '2023-02-02',
                },
                {
                    gameName: 'difference 2',
                    typeGame: 'solo',
                    time: '2:34',
                    playerName: 'joueur 2',
                    dateStart: '2023-02-02',
                },
                {
                    gameName: 'difference 2',
                    typeGame: 'mlyi',
                    time: '2:34',
                    playerName: 'joueur 2',
                    dateStart: '2023-02-02',
                },
            ],
        } as GameInfo;
        fixture.detectChanges();
        spyOn(component.gameService, 'deleteGame').and.returnValue(of(new HttpResponse<string>({ status: 200 })));
        spyOn(component.gameDeleted, 'emit');
        fixture.detectChanges();
        component.onDelete(component.card.gameName);
        tick();
        expect(component.gameService.deleteGame).toHaveBeenCalledWith(component.card.gameName);
        expect(component.gameDeleted.emit).toHaveBeenCalled();
    }));

    it('should alert the user that the delete call failed', fakeAsync(() => {
        component.card = {
            gameName: 'difference 1',
            difficulty: 'Facile',
            originalImageData: 'imageOriginal1',
            modifiedImageData: 'imageModifie1',
            listDifferences: ['diffrence 1', 'difference 2'],
            rankingMulti: [
                {
                    gameName: 'difference 1',
                    typeGame: 'multi',
                    time: '1:23',
                    playerName: 'joueur 1',
                    dateStart: '2023-01-01',
                },
                {
                    gameName: 'difference 1',
                    typeGame: 'multi',
                    time: '1:24',
                    playerName: 'joueur 1',
                    dateStart: '2023-01-01',
                },
                {
                    gameName: 'difference 1',
                    typeGame: 'multi',
                    time: '1:25',
                    playerName: 'joueur 1',
                    dateStart: '2023-01-01',
                },
            ],
            rankingSolo: [
                {
                    gameName: 'difference 2',
                    typeGame: 'solo',
                    time: '2:34',
                    playerName: 'joueur 2',
                    dateStart: '2023-02-02',
                },
                {
                    gameName: 'difference 2',
                    typeGame: 'solo',
                    time: '2:34',
                    playerName: 'joueur 2',
                    dateStart: '2023-02-02',
                },
                {
                    gameName: 'difference 2',
                    typeGame: 'mlyi',
                    time: '2:34',
                    playerName: 'joueur 2',
                    dateStart: '2023-02-02',
                },
            ],
        } as GameInfo;
        fixture.detectChanges();
        spyOn(component.gameService, 'deleteGame').and.throwError('blabla');
        spyOn(component.gameDeleted, 'emit');
        const spyOnAlert = spyOn(window, 'alert');
        fixture.detectChanges();
        component.onDelete(component.card.gameName);
        tick();
        expect(component.gameService.deleteGame).toHaveBeenCalledWith(component.card.gameName);
        expect(spyOnAlert).toHaveBeenCalledOnceWith('la suppression du jeu a échoué');
    }));
});
