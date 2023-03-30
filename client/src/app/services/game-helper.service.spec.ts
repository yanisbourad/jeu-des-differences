import { TestBed } from '@angular/core/testing';

import { GameHelperService } from './game-helper.service';

describe('GameHelperService', () => {
    let service: GameHelperService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameHelperService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
