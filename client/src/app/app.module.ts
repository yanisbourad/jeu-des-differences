import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { HeaderComponent } from './components/header/header.component';
import { BannerComponent } from './components/banner/banner.component';
import { SelectionJeuPageComponent } from './pages/selection-jeu-page/selection-jeu-page.component';
import { PreviousNextComponent } from './components/previous-next/previous-next.component';
import { GameCardComponent } from './components/game-card/game-card.component';
import { CardDisplayerComponent } from './components/card-displayer/card-displayer.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { NamePopupComponent } from './components/name-popup/name-popup.component';

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
        SidebarComponent,
        HeaderComponent,
        BannerComponent,
        SelectionJeuPageComponent,
        PreviousNextComponent,
        GameCardComponent,
        CardDisplayerComponent,
        NamePopupComponent,
    ],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule, MatGridListModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
