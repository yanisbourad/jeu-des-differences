import { RendererFactory2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DrawService } from '@app/services/draw.service';
import { GameLogic } from './game-logic';

export class GameSolo extends GameLogic {
    constructor(private myDialog: MatDialog, private myDrawService: DrawService, myRendererFactory: RendererFactory2) {
        super(myDialog, myDrawService, myRendererFactory);
    }

    get width(): number {
        return this.width;
    }

    displayIcons(): void {}
    handleDifferenceFound(): void {}
    saveGameRecord(): void {}
    sendFoundMessage(): void {}
    sendErrorMessage(): void {}
}
