import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { MatGridListModule } from '@angular/material/grid-list';
import { By } from '@angular/platform-browser';
import * as constants from '@app/configuration/const-game';
import * as constantsMock from '@app/configuration/const-mock';

import { GameCardHandlerService } from '@app/services/game-card-handler-service.service';
import { GameDatabaseService } from '@app/services/game-database.service';
import { GameInfo } from '@common/game';
import { of } from 'rxjs';
import { CardDisplayerComponent } from './card-displayer.component';

const mockCards: GameInfo[] = constantsMock.MOCK_CARDS;

describe('CardDisplayerComponent', () => {
    let component: CardDisplayerComponent;
    let fixture: ComponentFixture<CardDisplayerComponent>;
    let communicationServiceSpy: jasmine.SpyObj<GameDatabaseService>;
    let gameCardHandlerServiceSpy: jasmine.SpyObj<GameCardHandlerService>;
    let changeDetectorRefSpy: jasmine.SpyObj<ChangeDetectorRef>;

    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('GameDatabaseService', ['getAllGames']);
        gameCardHandlerServiceSpy = jasmine.createSpyObj('GameCardHandlerService', ['updateGameStatus']);
        changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
        TestBed.configureTestingModule({
            imports: [HttpClientModule, MatGridListModule],
            providers: [
                { provide: GameDatabaseService, useValue: communicationServiceSpy },
                { provide: GameCardHandlerService, useValue: gameCardHandlerServiceSpy },
                { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy },
            ],
            declarations: [CardDisplayerComponent],
        }).compileComponents();

        communicationServiceSpy.getAllGames.and.callFake(() => of(mockCards));

        fixture = TestBed.createComponent(CardDisplayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should go to next page', () => {
        component.currentPage = constants.ZERO;
        component.allPages = constants.THREE;
        component.goToNext();
        expect(component.currentPage).toEqual(constants.ONE);
    });

    it('should not go to next page', () => {
        component.currentPage = constants.TWO;
        component.allPages = constants.TWO;
        component.goToNext();
        expect(component.currentPage).toEqual(constants.TWO);
    });

    it('should go to previous page', () => {
        component.currentPage = constants.TWO;
        component.allPages = constants.THREE;
        component.goToPrevious();
        expect(component.currentPage).toEqual(constants.ONE);
    });

    it('should not go to previous page', () => {
        component.currentPage = constants.ZERO;
        component.allPages = constants.THREE;
        component.goToPrevious();
        expect(component.currentPage).toEqual(constants.ZERO);
    });

    it('should get the exact number of all pages if mod different of 0', () => {
        component.allCards.length = constants.FIVE;
        component.getCurrentPageCards();
        expect(component.allPages).toEqual(constants.ONE);
    });
    it('should get the exact number of all pages if mod equal of 0', () => {
        component.allCards.length = constants.EIGHT;
        component.getCurrentPageCards();
        expect(component.allPages).toEqual(constants.ONE);
    });

    it('should get all cards from the game database service', fakeAsync(() => {
        component.allCards = [];
        // on le reset car getAllGames est appellé OnInit
        communicationServiceSpy.getAllGames.calls.reset();
        component.updateCards();
        expect(component.allCards).toEqual(mockCards);
        expect(communicationServiceSpy.getAllGames).toHaveBeenCalledTimes(1);
        expect(gameCardHandlerServiceSpy.updateGameStatus).toHaveBeenCalled();
    }));

    it('should call goToPrevious() on previous button click', () => {
        spyOn(component, 'goToPrevious');
        const previousButton: DebugElement = fixture.debugElement.query(By.css('.previous-next-button:first-of-type'));
        previousButton.triggerEventHandler('click', null);
        expect(component.goToPrevious).toHaveBeenCalled();
    });

    it('should call goToNext() on next button click', () => {
        spyOn(component, 'goToNext');
        const nextButton: DebugElement = fixture.debugElement.query(By.css('.previous-next-button:last-of-type'));
        nextButton.triggerEventHandler('click', null);
        expect(component.goToNext).toHaveBeenCalled();
    });

    it('should display max 4 game cards by page', () => {
        const gridList = fixture.nativeElement.querySelector('mat-grid-list');
        expect(gridList.getAttribute('cols')).toEqual(constants.FOUR.toString());
    });
});
