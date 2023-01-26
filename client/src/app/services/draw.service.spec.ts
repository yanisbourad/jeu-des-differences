import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawService } from '@app/services/draw.service';

describe('DrawService', () => {
    let service: DrawService;
    let ctxStub: CanvasRenderingContext2D;

    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.context = ctxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
