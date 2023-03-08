import { Component, Input, OnInit } from '@angular/core';
import * as constants from '@app/configuration/const-game';
import { SocketClientService } from '@app/services/socket-client.service';
//import { SocketClientService } from '@app/services/socket-client.service';
//import { Socket } from 'socket.io-client';
import { SocketClient } from '@app/utils/socket-client';
// import * as io from 'socket.io-client';

@Component({
    selector: 'app-message-area',
    templateUrl: './message-area.component.html',
    styleUrls: ['./message-area.component.scss'],
})
export class MessageAreaComponent implements OnInit {
    @Input() playerName: string = '';
    @Input() message: string = '';
    playerInitials: string;
    date: Date = new Date();
    chatBoxDemo: number = constants.CHAT_BOX_DEMO;
    chatBox: number[] = new Array(this.chatBoxDemo);
    userList: string[] = [];
    socket: SocketClient;
    constructor(private readonly socketClient: SocketClientService) {}
    ngOnInit() {
        this.playerInitials = this.playerName[0];
    }

    getTimestamp(): string {
        return this.date.toLocaleTimeString();
    }
    sendMessage() {
        console.log(this.message);
        this.socketClient.sendMessage(this.message, this.playerName);
        console.log('taboune');
        this.socketClient.messageList.push({ message: this.message, userName: this.playerName, mine: true });
        console.log('taboune');
        this.message = '';
    }
}
