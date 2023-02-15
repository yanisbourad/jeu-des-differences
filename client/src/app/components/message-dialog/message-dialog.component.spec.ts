import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ClientTimeService } from '@app/services/client-time.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { MessageDialogComponent } from './message-dialog.component';
import spyObj = jasmine.SpyObj;

describe('MessageDialogComponent', () => {
    let component: MessageDialogComponent;
    let fixture: ComponentFixture<MessageDialogComponent>;
    let socket: spyObj<SocketClientService>;
    let timer: spyObj<ClientTimeService>;
    let router: spyObj<Router>;
    let matDialogSpy: typeof MAT_DIALOG_DATA;

    beforeEach(async () => {
        timer = jasmine.createSpyObj('ClientTimeService', ['resetTimer']);
        router = jasmine.createSpyObj('Router', ['navigate']);
        socket = jasmine.createSpyObj('SocketClientService', ['leaveRoom']);
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['close']);
        await TestBed.configureTestingModule({
            declarations: [MessageDialogComponent],
            imports: [MatDialogModule],
            providers: [
                { provide: SocketClientService, useValue: socket },
                { provide: ClientTimeService, useValue: timer },
                { provide: MAT_DIALOG_DATA, useValue: matDialogSpy },
                { provide: Router, useValue: router },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MessageDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('redirection should call navigate(), leaveRoom() and resetTimer()', () => {
        component.redirection();
        expect(router.navigate).toHaveBeenCalledWith(['/home']);
        expect(socket.leaveRoom).toHaveBeenCalled();
        expect(timer.resetTimer).toHaveBeenCalled();
    });
});
