import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { GameService } from '@app/services/game.service';
import { SocketClientService } from '@app/services/socket-client.service';
import { SocketClient } from '@app/utils/socket-client';
@Component({
    selector: 'app-message-area',
    templateUrl: './message-area.component.html',
    styleUrls: ['./message-area.component.scss'],
})
export class MessageAreaComponent implements OnInit {
    @Input() playerName: string = '';
    @Input() message: string = '';
    @ViewChild('chatBox') chatBoxRef: ElementRef;
    playerInitials: string;
    giveUp: boolean;
    date: Date = new Date();
    userList: string[] = [];
    socket: SocketClient;
    defaultColor: string[];
    position: string[];
    roomName: string = '';
    constructor(readonly socketClient: SocketClientService, readonly gameService: GameService) {}
    ngOnInit() {
        this.playerInitials = this.playerName[1];
        this.defaultColor = ['#69bd84', '#6ca2c7'];
        this.position = ['1%', '50%'];
        this.roomName = this.gameService.gameId + this.gameService.gameName;
    }

    getTimestamp(): string {
        return this.date.toLocaleTimeString();
    }
    sendMessage() {
        const dataToSend = {
            message: this.message,
            playerName: this.playerName,
            color: this.defaultColor[0],
            pos: this.position[0],
            gameId: this.roomName,
            event: false,
        };
        this.socketClient.sendMessage(dataToSend);
        this.addMessage({
            message: this.message,
            userName: this.playerName,
            mine: true,
            color: this.defaultColor[1],
            pos: this.position[1],
            event: false,
        });
        this.socketClient.messageList.push();
        this.message = '';
    }

    addMessage(message: { message: string; userName: string; mine: boolean; color: string; pos: string; event: boolean }) {
        this.socketClient.messageList.push(message);
    }

    handleGameClick(event: MouseEvent) {
        const targetElement = event.target as HTMLElement;
        if (targetElement !== document.getElementById('chat')) {
            return;
        }
    }
}
