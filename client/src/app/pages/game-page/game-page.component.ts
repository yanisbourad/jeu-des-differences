import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss']
})
export class GamePageComponent implements OnInit {
  readonly DEFAULT_WIDTH = 640;
  readonly DEFAULT_HEIGHT = 480;
  gameName : string;
  gameInfos : string;
  differences : number;
  //in infos component change display depending of the game mode (solo, multijoueur, temps limite)
  constructor() { 
  }

  ngOnInit(): void {
  }

  giveUp():void{
    //feedback message : {Êtes-vous sur de vouloir abandonner la partie? Cette action est irréversible.}
    //if yes do 
        //stop game 
        //save infos???
        //redirect user to main page
    //else close modal and continue the game

  }
}
