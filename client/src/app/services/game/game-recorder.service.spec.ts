import { TestBed } from '@angular/core/testing';

import { GameRecorderService } from './game-recorder.service';

describe('GameRecorderService', () => {
    let service: GameRecorderService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameRecorderService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
