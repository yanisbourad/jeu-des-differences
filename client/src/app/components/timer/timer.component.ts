import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {
@Input() countDown : number = 30; // the time must be transformed to second before being processed
second: number = 0;
minute: number = 0;
count: number = 0;

  constructor() { }

  ngOnInit(): void {
    this.startCountDown();
  }

  startTimer(): number{
    setInterval(() => {
      this.count++;
    }, 1000);
    return this.count;
  }

  startCountDown():number{
    setInterval(() => {
      this.countDown--;
    }, 1000);
    return this.countDown;
  }

  stopCountDown():void{
    this.countDown = 0;
  }

  formatTime(): string{
    return (this.minute < 10 ? "0" + this.minute : this.minute) + ":" + (this.second < 10 ? "0" + this.second : this.second);
  }

  transformCountDown (): string{
    this.second = this.countDown % 60;
    this.minute = Math.floor(this.countDown / 60);
    if(this.second<=0 && this.minute<=0){
      return "00:00";
    }
    else{
      return (this.second < 10 || this.minute < 10) ? this.formatTime() : this.minute + ":" + this.second;
    }
  }

  transform (): string{
    this.second = this.count % 60;
    this.minute = Math.floor(this.count / 60);
    return (this.second < 10 || this.minute < 10) ? this.formatTime() : this.minute + ":" + this.second;
  }

  stopTimer(): number{
    //return this.count;
    return 0;
  }

}
