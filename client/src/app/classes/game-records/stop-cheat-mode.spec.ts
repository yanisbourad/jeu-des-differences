import { StopCheatModeRecord } from './stop-cheat-mode';

describe('StopCheatMode', () => {
    let stopCheatModeRecord: StopCheatModeRecord;
    beforeEach(() => {
        stopCheatModeRecord = new StopCheatModeRecord();
    });
    it('should create an instance', () => {
        expect(stopCheatModeRecord).toBeTruthy();
    });
    it('should call stopCheating', () => {
        const component = jasmine.createSpyObj('GamePageComponent', ['cheatModeService']);
        component.cheatModeService = jasmine.createSpyObj('CheatModeService', ['stopCheating']);
        stopCheatModeRecord.do(component);
        expect(component.cheatModeService.stopCheating).toHaveBeenCalled();
    });
});
