import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { SelectionJeuPageComponent } from '@app/pages/selection-jeu-page/selection-jeu-page.component';
import { ConfigurationJeuPageComponent } from '@app/pages/configuration-jeu-page/configuration-jeu-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'classique', component: SelectionJeuPageComponent },
    { path: 'config', component: ConfigurationJeuPageComponent },
    // Here we can add the routes for the other pages //

    // this route is used to redirect to the home page if the url is not recognized //
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
