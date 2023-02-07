import { TestBed } from '@angular/core/testing';

import { GameService } from './game.service';

describe('GameService', () => {
    let gameService: GameService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        gameService = TestBed.inject(GameService);
    });

    it('should be created', () => {
        expect(gameService).toBeTruthy();
    });
});
