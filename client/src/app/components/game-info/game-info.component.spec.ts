import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameService } from '@app/services/game.service';
import SpyObj = jasmine.SpyObj;
import { GameInfoComponent } from './game-info.component';

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

        fixture = TestBed.createComponent(GameInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should call loading method', () => {
        component.ngOnInit();
        expect(component.ngOnInit).toHaveBeenCalled();
        expect(gameServiceSpy.displayIcons).toHaveBeenCalled();
    });
});
