import { StopHintsRecord } from './stop-hints';

describe('StopHints', () => {
    let stopHintsRecord: StopHintsRecord;
    beforeEach(() => {
        stopHintsRecord = new StopHintsRecord();
    });
    it('should create an instance', () => {
        expect(stopHintsRecord).toBeTruthy();
    });
    it('should call stopHints', () => {
        const component = jasmine.createSpyObj('GamePageComponent', ['hintsService']);
        component.hintsService = jasmine.createSpyObj('HintsService', ['stopHints']);
        stopHintsRecord.do(component);
        expect(component.hintsService.stopHints).toHaveBeenCalled();
    });
});
