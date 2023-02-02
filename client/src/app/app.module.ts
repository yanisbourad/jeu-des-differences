import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CanvasNgxComponent } from './components/canvas-ngx/canvas-ngx.component';
import { DrawingToolBarComponent } from './components/drawing-tool-bar/drawing-tool-bar.component';
import { HeaderComponent } from './components/header/header.component';
import { BannerComponent } from './components/banner/banner.component';
import { SelectionJeuPageComponent } from './pages/selection-jeu-page/selection-jeu-page.component';
import { PreviousNextComponent } from './components/previous-next/previous-next.component';
import { GameCardComponent } from './components/game-card/game-card.component';
import { CardDisplayerComponent } from './components/card-displayer/card-displayer.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { NamePopupComponent } from './components/name-popup/name-popup.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ConfigurationJeuPageComponent } from './pages/configuration-jeu-page/configuration-jeu-page.component';
import { MessageAreaComponent } from './components/message-area/message-area.component';
import { TimerComponent } from './components/timer/timer.component';
import { ValidateCreateBtnComponent } from './components/validate-create-btn/validate-create-btn.component';
import { GameCreationPageComponent } from './pages/game-creation-page/game-creation-page.component';
import { GamePageComponent } from './pages/game-page/game-page.component';
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
        TimerComponent,
        GamePageComponent,
        MessageAreaComponent,
        ValidateCreateBtnComponent,
        BannerComponent,
        SelectionJeuPageComponent,
        PreviousNextComponent,
        GameCardComponent,
        CardDisplayerComponent,
        NamePopupComponent,
        ConfigurationJeuPageComponent,
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
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
