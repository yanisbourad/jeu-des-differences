import { Component, Input, OnInit } from '@angular/core';
import { Time } from '@app/interfaces/time';
import { TimeService } from '@app/services/time.service';
@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {
  @Input() isClassicMode : boolean = true; // can be classique or temps limite
  @Input() serverTime : number = 0;
  time: Time;
  
  constructor(private readonly timeService: TimeService ) {
      this.time = {minute: 0, second: 0};
   }
  
    ngOnInit(): void {
      // (this.isClassicMode)? this.timeService.startTimer() : this.timeService.startCountDown();
    }
  
  

  formatTime(): string{
    return (this.time.minute < 10 ? "0" + this.time.minute : this.time.minute) + ":" 
    + (this.time.second < 10 ? "0" + this.time.second : this.time.second);
  }

  transformCountDown (): string{ 
    this.time.second = this.timeService.getCountDown() % 60;
    this.time.minute = Math.floor(this.timeService.getCountDown() / 60);
    if (this.time.second ===0 && this.time.minute === 0){
      this.timeService.stopTimer();
      return (this.time.second < 10 || this.time.minute < 10) ? this.formatTime() : this.time.minute + ":" + this.time.second;
    }
    else{
      return (this.time.second < 10 || this.time.minute < 10) ? this.formatTime() : this.time.minute + ":" + this.time.second;
    }
  }

  transform (): string{
    // this.time.second = this.timeService.getCount() % 60;
    this.time.second = this.serverTime % 60;
    // this.time.minute = Math.floor(this.timeService.getCount() / 60);
    this.time.minute = Math.floor(this.serverTime / 60);
    //this.time.minute = Math.floor(this.timeService.getCount() / 60);
    return (this.time.second < 10 || this.time.minute < 10) ? this.formatTime() : this.time.minute + ":" + this.time.second;
  }
}
