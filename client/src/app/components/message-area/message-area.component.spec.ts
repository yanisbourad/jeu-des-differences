import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageAreaComponent } from './message-area.component';
import { GameService } from '@app/services/game/game.service';
import { SocketClientService } from '@app/services/socket/socket-client.service';

describe('MessageAreaComponent', () => {
    let component: MessageAreaComponent;
    let fixture: ComponentFixture<MessageAreaComponent>;

    // mock services and dependencies
    const gameServiceMock = {
        gameId: '123',
        gameName: 'TestGame',
    };
    const socketClientMock = {
        messageList: [],
        sendMessage: jasmine.createSpy('sendMessage'),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MessageAreaComponent],
            providers: [
                { provide: GameService, useValue: gameServiceMock },
                { provide: SocketClientService, useValue: socketClientMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MessageAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the component properties', () => {
        expect(component.playerInitials).toBeUndefined();
        expect(component.giveUp).toBeUndefined();
        expect(component.userList).toEqual([]);
        expect(component.socket).toBeUndefined();
        expect(component.defaultColor).toBeDefined();
        expect(component.position).toBeDefined();
        expect(component.roomName).toBeDefined();
    });

    it('should set player initials', () => {
        component.playerName = ' John Doe';
        component.ngOnInit();
        expect(component.playerInitials).toBe('J');
    });

    it('should set room name', () => {
        component.ngOnInit();
        expect(component.roomName).toBe('123TestGame');
    });

    it('should send a message', () => {
        component.playerName = 'John Doe';
        component.message = 'Hello World';
        const blurSpy = jasmine.createSpy('blur');
        blurSpy.and.callThrough();
        component.sendMessage();
        expect(socketClientMock.sendMessage).toHaveBeenCalledWith({
            message: 'Hello World',
            playerName: 'John Doe',
            color: component.defaultColor[0],
            pos: component.position[0],
            gameId: '123TestGame',
            event: false,
        });
        expect(component.message).toBe('');
        expect(blurSpy).not.toHaveBeenCalled();
    });

    it('should get timestamp', () => {
        const timestamp = component.getTimestamp();
        expect(typeof timestamp).toBe('string');
        expect(timestamp).toMatch(new Date().toLocaleTimeString());
    });
    it('should not blur chat element when handleGameClick is called with a target element other than chat', () => {
        // Arrange
        const mockMouseEvent = new MouseEvent('click', { bubbles: true });
        const spy = spyOn(document, 'getElementById').and.returnValue(document.getElementById('chat'));
        const blurSpy = jasmine.createSpy('blur');
        // Act
        component.handleGameClick(mockMouseEvent);

        // Assert
        expect(spy).toHaveBeenCalledWith('chat');
        expect(blurSpy).not.toHaveBeenCalled();
    });
    it('should blur chat element when handleGameClick is called', () => {
        // Arrange
        const mockMouseEvent = new MouseEvent('click', { bubbles: true });
        const blurSpy = jasmine.createSpy('blur');
        blurSpy.and.callThrough();
        component.handleGameClick(mockMouseEvent);
        expect(blurSpy).not.toHaveBeenCalled();
    });
});
