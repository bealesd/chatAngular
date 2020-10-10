import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';

import { MessagesComponent } from './messages/messages.component';
import { ChatComponent } from './chat-main/chat-main.component';
import { ChatDetailComponent } from './chat-detail/chat-detail.component';

//emoji issue?
import { PickerModule } from '@ctrl/ngx-emoji-mart';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './interceptors/tokenInterceptor';
import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { DialogBoxComponent } from './dialog-box/dialog-box.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CalendarMainComponent } from './calendar-main/calendar-main.component';




@NgModule({
  declarations: [
    AppComponent,

    MessagesComponent,
    ChatComponent,
    ChatDetailComponent,
    LoginComponent,
    DialogBoxComponent,
    MenuBarComponent,
    CalendarMainComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    PickerModule,
    AppRoutingModule,
    FormsModule,

    ReactiveFormsModule,

  ],
  providers: [
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: TokenInterceptor,
    //   multi: true
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
