import { Injectable } from '@angular/core';
import { SocketClientService } from './socket-client.service';
import {DELAY_BEFORE_EMITTING_TIME} from'../../../../server/app/gateways/chat/chat.gateway.constants'
@Injectable({
  providedIn: 'root'
})
export class ClientTimeService {

  roomName: string = "test7 room"; // from database or something else
  count: number = 0;
  time: number | unknown;

  constructor(public readonly socketService: SocketClientService) {}

  startTimer(): void {
      this.time = setInterval(() => {
        this.count = this.socketService.getRoomTime(this.roomName);
        this.socketService.sendTime(this.count, this.roomName);
        this.count++;
      }, DELAY_BEFORE_EMITTING_TIME);
  }

  getCount(): number {
      return this.count;
  }

  stopTimer(): void {
      clearInterval(this.time as number);
  }
}
