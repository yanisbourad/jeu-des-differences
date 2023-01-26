import { TestBed } from '@angular/core/testing';

import { ImageDiffService } from './image-diff.service';

describe('ImageDiffService', () => {
    let service: ImageDiffService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ImageDiffService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
