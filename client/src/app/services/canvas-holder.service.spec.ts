import { TestBed } from '@angular/core/testing';
import { CanvasHolderService } from './canvas-holder.service';

describe('CanvasHolderServiceService', () => {
    let service: CanvasHolderService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CanvasHolderService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
