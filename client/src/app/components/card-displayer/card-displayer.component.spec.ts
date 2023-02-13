import { HttpClientModule } from '@angular/common/http';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { GameDatabaseService } from '@app/services/game-database.service';
import { GameInfo } from '@common/game';
import { of } from 'rxjs';
import { CardDisplayerComponent } from './card-displayer.component';
import { MatGridListModule } from '@angular/material/grid-list';

const MOCK_CARDS: GameInfo[] = [
    {
        gameName: 'difference 1',
        difficulty: 'Facile',
        originalImageData: 'imageOriginal1',
        modifiedImageData: 'imageModifie1',
        listDifferences: ['diffrence 1', 'difference 2'],
        rankingMulti: [],
        rankingSolo: [],
    },
    {
        gameName: 'difference 2',
        difficulty: 'Facile',
        originalImageData: 'imageOriginal2',
        modifiedImageData: 'imageModifie2',
        listDifferences: ['diffrence 3', 'difference 4'],
        rankingMulti: [],
        rankingSolo: [],
    },
];

describe('CardDisplayerComponent', () => {
    let component: CardDisplayerComponent;
    let fixture: ComponentFixture<CardDisplayerComponent>;
    let communicationServiceSpy: jasmine.SpyObj<GameDatabaseService>;
    let nextButton: DebugElement;
    let previousButton: DebugElement;

    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('GameDatabaseService', ['getAllGames']);

        TestBed.configureTestingModule({
            imports: [HttpClientModule, MatGridListModule],
            providers: [{ provide: GameDatabaseService, useValue: communicationServiceSpy }],
            declarations: [CardDisplayerComponent],
        }).compileComponents();

        communicationServiceSpy.getAllGames.and.callFake(() => of(MOCK_CARDS));

        fixture = TestBed.createComponent(CardDisplayerComponent);
        component = fixture.componentInstance;
        previousButton = fixture.debugElement.query(By.css('.previous-next-button:first-of-type'));
        nextButton = fixture.debugElement.query(By.css('.previous-next-button:last-of-type'));
        fixture.detectChanges();
    });

    it('should go to next page', () => {
        component.currentPage = 0;
        component.allPages = 3;
        component.goToNext();
        expect(component.currentPage).toEqual(1);
    });

    it('should not go to next page', () => {
        component.currentPage = 2;
        component.allPages = 2;
        component.goToNext();
        expect(component.currentPage).toEqual(2);
    });

    it('should go to previous page', () => {
        component.currentPage = 2;
        component.allPages = 3;
        component.goToPrevious();
        expect(component.currentPage).toEqual(1);
    });

    it('should not go to previous page', () => {
        component.currentPage = 0;
        component.allPages = 3;
        component.goToPrevious();
        expect(component.currentPage).toEqual(0);
    });

    it('should get the exact number of all pages if mod different of 0', () => {
        component.allCards.length = 5;
        component.getCurrentPageCards();
        expect(component.allPages).toEqual(1);
    });
    it('should get the exact number of all pages if mod equal of 0', () => {
        component.allCards.length = 8;
        component.getCurrentPageCards();
        expect(component.allPages).toEqual(1);
    });

    it('should get all cards from the game database service', fakeAsync(() => {
        component.allCards = [];
        communicationServiceSpy.getAllGames.calls.reset(); //
        component.getAllCards();
        tick(1);
        expect(component.allCards).toEqual(MOCK_CARDS);
        expect(communicationServiceSpy.getAllGames).toHaveBeenCalledTimes(1);
    }));

    it('should call goToPrevious() on previous button click', () => {
        spyOn(component, 'goToPrevious');
        previousButton.triggerEventHandler('click', null);
        expect(component.goToPrevious).toHaveBeenCalled();
    });

    it('should call goToNext90 on next button click', () => {
        spyOn(component, 'goToNext');
        nextButton.triggerEventHandler('click', null);
        expect(component.goToNext).toHaveBeenCalled();
    });

    it('should display 4 game cards by page', () => {
        const cards = fixture.debugElement.queryAll(By.css('mat-grid-tile'));
        expect(cards.length).toBe(4);
    });
});
