import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-time-popup',
  templateUrl: './time-popup.component.html',
  styleUrls: ['./time-popup.component.scss']
})
export class TimePopupComponent implements OnInit {
  @Input() timer1:number = 30; 
  @Input() timer2:number = 25; 
  @Input() timer3:number = 5; 
  constructor() { }

  ngOnInit(): void {
  }
  incrementTime1(){
    this.timer1 += 5; 
  }
  decrementTime1(){
    this.timer1-= 5;
  }
  incrementTime2(){
    this.timer2 += 5; 
  }
  decrementTime2(){
    this.timer2-= 5;
  }
  incrementTime3(){
    this.timer3 += 5; 
  }
  decrementTime3(){
    this.timer3-= 5;
  }

}
