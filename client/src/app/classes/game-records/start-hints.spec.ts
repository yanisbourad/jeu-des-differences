import { StartHintsRecord } from './start-hints';
describe('StartHints', () => {
    let startHintsRecord: StartHintsRecord;

    beforeEach(() => {
        startHintsRecord = new StartHintsRecord(0);
    });

    it('should create an instance', () => {
        expect(startHintsRecord).toBeTruthy();
    });

    it('should call showHints', () => {
        const component = jasmine.createSpyObj('GamePageComponent', ['hintsService']);
        component.hintsService = jasmine.createSpyObj('HintsService', ['showHints']);
        startHintsRecord.do(component);
        expect(component.hintsService.showHints).toHaveBeenCalled();
    });
});
