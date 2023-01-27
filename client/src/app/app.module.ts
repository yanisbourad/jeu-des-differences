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
import { CanvasNgxComponent } from './components/canvas-ngx/canvas-ngx.component';
import { DrawingToolBarComponent } from './components/drawing-tool-bar/drawing-tool-bar.component';
import { DrawingValidatorComponent } from './components/drawing-tool-bar/drawing-validator/drawing-validator.component';
import { HeaderComponent } from './components/header/header.component';
import { GameCreationPageComponent } from './pages/game-creation-page/game-creation-page.component';

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
        GameCreationPageComponent,
        CanvasNgxComponent,
        DrawingToolBarComponent,
        DrawingValidatorComponent,
    ],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
