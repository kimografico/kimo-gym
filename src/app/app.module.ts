import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ExerciseListComponent } from './components/exercise-list/exercise-list.component';
import { RoutinesPublicComponent } from './components/routines-public/routines-public.component';
import { RoutinesUserComponent } from './components/routines-user/routines-user.component';
import { SessionsUserComponent } from './components/sessions-user/sessions-user.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, LoginComponent, ExerciseListComponent, RoutinesPublicComponent, RoutinesUserComponent, SessionsUserComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
