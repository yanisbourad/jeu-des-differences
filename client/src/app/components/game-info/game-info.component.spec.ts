import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameService } from '@app/services/game.service';
import { GameInfoComponent } from './game-info.component';
import SpyObj = jasmine.SpyObj;

describe('GameInfoComponent', () => {
    let gameServiceSpy: SpyObj<GameService>;
    let component: GameInfoComponent;
    let fixture: ComponentFixture<GameInfoComponent>;
    let gameService: SpyObj<GameService>;

    beforeEach(() => {
        gameServiceSpy = jasmine.createSpyObj('GameService', ['displayIcons']);
    });

    beforeEach(async () => {
        gameService = jasmine.createSpyObj<GameService>(['displayIcons']);
        await TestBed.configureTestingModule({
            declarations: [GameInfoComponent],
            providers: [{ provide: GameService, useValue: gameService }]
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

    it('should call loading method', () => {
        spyOn(component, 'loading');
        component.ngOnInit();
        expect(component.loading).toHaveBeenCalled();
    });

    it('should call displayIcons method of gameService', () => { 
        spyOn(gameService, 'displayIcons'); 
        component.loading(); 
        
        expect(gameService.displayIcons).toHaveBeenCalled(); 
     }); 
});
