import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import * as constants from '@app/configuration/const-game';
import { GameInformation } from '@app/interfaces/game-information';
import { GameService } from '@app/services/game/game.service';
import { GameInfoComponent } from './game-info.component';
import SpyObj = jasmine.SpyObj;

const mockCards: GameInformation = {
    gameTitle: 'titre 1',
    gameMode: 'solo',
    gameDifficulty: 'facile',
    nDifferences: 5,
};
describe('GameInfoComponent', () => {
    let component: GameInfoComponent;
    let fixture: ComponentFixture<GameInfoComponent>;
    let gameServiceSpy: SpyObj<GameService>;

    beforeEach(async () => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['displayIcons']);
        gameServiceSpy.gameInformation = mockCards;
        TestBed.configureTestingModule({
            declarations: [GameInfoComponent],
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
        }).compileComponents();
        fixture = TestBed.createComponent(GameInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should call displayIcons from gameService', fakeAsync(() => {
        component.ngOnInit();
        tick(constants.WAITING_TIME);
        expect(gameServiceSpy.displayIcons).toHaveBeenCalled();
    }));
});
