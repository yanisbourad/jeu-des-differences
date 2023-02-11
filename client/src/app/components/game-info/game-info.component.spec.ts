import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameInfoComponent } from './game-info.component';

describe('GameInfoComponent', () => {
    let component: GameInfoComponent;
    let fixture: ComponentFixture<GameInfoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameInfoComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should call displayIcons after timeout', () => {    
        const gameService = TestBed.get(component);    
        spyOn(gameService, 'displayIcons');    
    
        component.ngOnInit();    
    
        setTimeout(() => {      
          expect(gameService.displayIcons).toHaveBeenCalled();    
        }, 250);   }); 
    });


