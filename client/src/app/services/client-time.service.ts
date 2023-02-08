import { Injectable } from '@angular/core';
import { DELAY_BEFORE_EMITTING_TIME } from '../../../../server/app/gateways/chat/chat.gateway.constants';
import { SocketClientService } from './socket-client.service';
@Injectable({
    providedIn: 'root',
})
export class ClientTimeService {
  count: number = 0;
  time: number | unknown;

    constructor(readonly socketService: SocketClientService) {
  }

    startTimer(): void {
        this.time = setInterval(() => {
            this.count = this.socketService.getRoomTime(this.socketService.getRoomName());
            this.socketService.sendTime(this.count, this.socketService.getRoomName());
            this.count++;
        }, DELAY_BEFORE_EMITTING_TIME);
    }

  getCount(): number {
      return this.count;
  }

  stopTimer(): void {
      clearInterval(this.time as number);
  }

  resetTimer(): void {
      this.count = 0;
  }
}
