import { TestBed } from '@angular/core/testing';

import { HintsDisplayService } from './hints-display.service';

describe('HintsDisplayService', () => {
  let service: HintsDisplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HintsDisplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
