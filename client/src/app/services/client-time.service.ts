import { Injectable } from '@angular/core';
import { SocketClientService } from './socket-client.service';

@Injectable({
  providedIn: 'root'
})
export class ClientTimeService {

  roomName: string = "test8 room"; // from database or something else
  count: number = 0;
  countDown: number = 30; // from database or something else. The time must be transformed to second before being processed
  time: any;

  constructor(public readonly socketService: SocketClientService) {
    //this.count = this.socketService.getRoomTime(this.roomName);
  }

  startTimer(): void {
    
      this.time = setInterval(() => {
        this.count = this.socketService.getRoomTime(this.roomName);
        console.log("startTimer", this.count)
        this.socketService.sendTime(this.count, this.roomName);
        this.count++;
      }, 1000);
  }

  startCountDown(): number {
      this.time = setInterval(() => {
          this.countDown--;
      }, 1000);
      return this.countDown;
  }

  getCount(): number {
    
      return this.count;
  }

  addTime(time: number): void {
      this.count += time;
  }

  getCountDown(): number {
      return this.countDown;
  }

  stopTimer(): void {
      clearInterval(this.time);
  }

}
