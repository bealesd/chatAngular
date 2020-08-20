import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MessagesComponent } from './messages/messages.component';
import { ChatComponent } from './chat/chat.component';
import { ChatDetailComponent } from './chat-detail/chat-detail.component';

import { PickerModule } from '@ctrl/ngx-emoji-mart';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './auth/tokenInterceptor';
import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,

    MessagesComponent,
    ChatComponent,
    ChatDetailComponent,
    LoginComponent,


  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    PickerModule,
    AppRoutingModule
  ],
  providers: [
    {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true
  }
],
  bootstrap: [AppComponent]
})
export class AppModule { }
