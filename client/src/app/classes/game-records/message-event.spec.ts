import { GameMessageEvent } from '@app/classes/game-records/message-event';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { GameRecorderService } from '@app/services/game/game-recorder.service';

describe('GameMessageEvent', () => {
    let component: jasmine.SpyObj<GamePageComponent>;
    let gameRecordService: jasmine.SpyObj<GameRecorderService>;
    let event: GameMessageEvent;

    beforeEach(() => {
        component = jasmine.createSpyObj<GamePageComponent>('GamePageComponent', ['showMessage']);
        gameRecordService = jasmine.createSpyObj<GameRecorderService>('GameRecorderService', ['do']);
        event = new GameMessageEvent({
            message: 'string',
            playerName: 'string',
            mine: true,
            color: 'string',
            pos: 'string',
            event: true,
        });
    });

    it('should set the time property on instantiation', () => {
        expect(event.time).toBeDefined();
    });

    it('should call showMessage on the component with the provided message when do is called', () => {
        event.do(component);
        expect(component.showMessage).toHaveBeenCalledWith(event.message);
    });

    it('should call the gameRecordService do method with itself when record is called', () => {
        event.record(gameRecordService);
        expect(gameRecordService.do).toHaveBeenCalledWith(event);
    });
});
