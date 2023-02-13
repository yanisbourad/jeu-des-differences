import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameService } from '@app/services/game.service';
import { GameInfoComponent } from './game-info.component';
import SpyObj = jasmine.SpyObj;

describe('GameInfoComponent', () => {
    let gameServiceSpy: SpyObj<GameService>;
    let component: GameInfoComponent;
    let fixture: ComponentFixture<GameInfoComponent>;

    beforeEach(() => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['displayIcons']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameInfoComponent],
            providers: [{ provide: GameService, useValue: gameServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should call displayIcons from gameService', () => {
        component.ngOnInit();
        expect(component.ngOnInit()).toHaveBeenCalled();
        expect(gameServiceSpy.displayIcons).toHaveBeenCalled();
    });
});
