import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {
@Input() time : number;
second: number = 0;
minute: number = 0;
count: number = 0;

  constructor() { }

  ngOnInit(): void {
    this.startTimer();
  }

  startTimer(): number{
    setInterval(() => {
      this.count++;
      console.log(this.count);
    }, 1000);
    return this.count;
  }

  startCountDown():number{
    setInterval(() => {
      this.time--;
      console.log(this.time);
    }, 1000);
    return this.time;
  }

  formatTime(): string{
    return (this.minute < 10 ? "0" + this.minute : this.minute) + ":" + (this.second < 10 ? "0" + this.second : this.second);
  }

  transform (): string{
    this.second = this.count % 60;
    this.minute = Math.floor(this.count / 60);
    return (this.second < 10 || this.minute < 10) ? this.formatTime() : this.minute + ":" + this.second;
  }

  stopTimer():void {
    console.log("stop");
  }

}
