import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GameInfos } from '@app/interfaces/gameInfos';
import * as imagePath from 'src/app/utils/image-constantes';
import { TimeService } from '@app/services/time.service';
import { DrawService } from '@app/services/draw.service';
import { Vec2 } from '@app/interfaces/vec2';
import { MouseButton } from '@app/components/play-area/play-area.component';
import { SocketClientService } from '@app/services/socket-client.service';

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss']
})
export class GamePageComponent implements OnInit {
  @ViewChild('canvas1', { static: true })  canvas1!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvas2', { static: true })  canvas2!: ElementRef<HTMLCanvasElement>;

  readonly DEFAULT_WIDTH = 640;
  readonly DEFAULT_HEIGHT = 480;
  mousePosition: Vec2 = { x: 0, y: 0 };

  gameInfos:GameInfos = { // values will be coming from the data base
    gameName: 'Mont Saint-Hilaire',
    gameInfos: 'Partie Classique en mode solo',
    mode: "solo",
    nbrDifferences: 8,
    playerName:"Oscar",
    time: 50,
    hintNbr: 3,
    isClassical: true
  };
  serverTime:number = 0;
  differences : string[] = new Array(this.gameInfos.nbrDifferences);
  differencesFound : number = 0;
  hints : string[] = new Array(this.gameInfos.hintNbr);
  hintUsed : number = 0;

  //in infos component change display depending of the game mode (solo, multijoueur, temps limite)
  constructor( private readonly timeService: TimeService, private readonly drawService: DrawService, public readonly socket:SocketClientService) {}

  ngOnInit(): void {  
    //this.loadImage();
    this.socket.connect();
    this.socket.classicalMode(true);
    console.log(this.socket.getServerMessage() + " " + this.socket.getServerTime())
    this.generateDiff();
    this.generateHint();
    this.timeService.setCountDown(this.gameInfos.time);
    // (this.gameInfos.isClassical)? this.timeService.startTimer() : this.timeService.startCountDown();
    if (this.gameInfos.isClassical){
      
    }else{
     
    }
  }


  mouseHitDetect(event: MouseEvent) {
    if (event.button === MouseButton.Left) {
        this.mousePosition = { x: event.offsetX, y: event.offsetY };
        this.diffFound();
        this.drawService.drawWord("trouvé", event)
    }
}
  generateDiff(): void{
    for (let i = 0; i < this.gameInfos.nbrDifferences; i++){
      this.differences[i] = imagePath.IMAGE_DIFF_PATH[0];
    }
    console.log(this.socket.getServerMessage())
  }

  diffFound(): void{ // will be uesful to determine what to do if a difference is found
    if (this.differencesFound < this.gameInfos.nbrDifferences){
      this.differencesFound++;
      this.differences.pop();
      this.differences.unshift(imagePath.IMAGE_DIFF_PATH[1]);
    }
    if(this.differencesFound === this.gameInfos.nbrDifferences){
      this.timeService.stopTimer();
    }
  }
 
  async loadImage(): Promise<void> {
    const original_image = new Image();
    const modified_image = new Image();
    original_image.src = '../../../assets/img/k3FhRA.jpg';
    createImageBitmap(original_image).then((imageBitmap) => {
      this.drawService.drawImage(imageBitmap,this.canvas1.nativeElement);
    });
    modified_image.src = '../../../assets/img/k3FhRA.jpg';
    createImageBitmap(modified_image).then((imageBitmap) => {
      this.drawService.drawImage(imageBitmap,this.canvas2.nativeElement);
    });
    }

  generateHint():void{
    for (let i = 0; i < this.gameInfos.hintNbr; i++){
      this.hints[i] = imagePath.IMAGE_HINT_PATH;
    }
  }

  getHint():void{
    if(this.hintUsed < this.gameInfos.hintNbr){
      this.hintUsed++;
      this.hints.pop();
    }
    this.timeService.addTime(5, this.gameInfos.isClassical);
  }

  giveUp():void{
    //open modal
    //feedback message : {Êtes-vous sur de vouloir abandonner la partie? Cette action est irréversible.}
    //if yes do 
        //stop game 
        //save infos???
        //redirect user to main page
    //else close modal and continue the game
  }

}
