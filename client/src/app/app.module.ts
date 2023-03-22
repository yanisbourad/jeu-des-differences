import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { BannerComponent } from './components/banner/banner.component';
import { CanvasNgxComponent } from './components/canvas-ngx/canvas-ngx.component';
import { CardDisplayerComponent } from './components/card-displayer/card-displayer.component';
import { DrawingToolBarComponent } from './components/drawing-tool-bar/drawing-tool-bar.component';
import { GameCardComponent } from './components/game-card/game-card.component';
import { GameInfoComponent } from './components/game-info/game-info.component';
import { GameNameSaveComponent } from './components/game-name-save/game-name-save.component';
import { GeneralFeedbackComponent } from './components/general-feedback/general-feedback.component';
import { HeaderComponent } from './components/header/header.component';
import { MessageAreaComponent } from './components/message-area/message-area.component';
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';
import { NamePopupComponent } from './components/name-popup/name-popup.component';
import { PlayerWaitPopupComponent } from './components/player-wait-popup/player-wait-popup.component';
import { TimePopupComponent } from './components/time-popup/time-popup.component';
import { TimerComponent } from './components/timer/timer.component';
import { ValidateCreateBtnComponent } from './components/validate-create-btn/validate-create-btn.component';
import { GameCreationPageComponent } from './pages/game-creation-page/game-creation-page.component';
import { GamePageComponent } from './pages/game-page/game-page.component';
import { GamePageConfigurationComponent } from './pages/game-page-configuration/game-page-configuration.component';
import { GamePageSelectionComponent } from './pages/game-page-selection/game-page-selection.component';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        MainPageComponent,
        PlayAreaComponent,
        TimerComponent,
        HeaderComponent,
        GameCreationPageComponent,
        CanvasNgxComponent,
        DrawingToolBarComponent,
        GamePageComponent,
        MessageAreaComponent,
        ValidateCreateBtnComponent,
        BannerComponent,
        GameCardComponent,
        CardDisplayerComponent,
        NamePopupComponent,
        TimePopupComponent,
        GameInfoComponent,
        GameNameSaveComponent,
        MessageDialogComponent,
        PlayerWaitPopupComponent,
        GeneralFeedbackComponent,
        GamePageConfigurationComponent,
        GamePageSelectionComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatGridListModule,
        MatDialogModule,
        MatFormFieldModule,
        OverlayModule,
    ],
    providers: [MatDialog],
    bootstrap: [AppComponent],
})
export class AppModule {}
