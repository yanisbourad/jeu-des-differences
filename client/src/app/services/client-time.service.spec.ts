import { TestBed } from '@angular/core/testing';

import { ClientTimeService } from './client-time.service';

describe('ClientTimeService', () => {
    let service: ClientTimeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ClientTimeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
