// create a basic test for the class StartCheatMode
import { StartCheatModeRecord } from './start-cheat-mode';
describe('StartCheatMode', () => {
    let showNotADiffRecord: StartCheatModeRecord;
    beforeEach(() => {
        showNotADiffRecord = new StartCheatModeRecord();
    });
    it('should create an instance', () => {
        expect(showNotADiffRecord).toBeTruthy();
    });
    it('should call cheatMode', () => {
        const component = jasmine.createSpyObj('GamePageComponent', ['cheatModeService']);
        component.cheatModeService = jasmine.createSpyObj('CheatModeService', ['cheatMode']);
        showNotADiffRecord.do(component);
        expect(component.cheatModeService.cheatMode).toHaveBeenCalled();
    });
});
