import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MessagesComponent } from './messages/messages.component';
import { ChatComponent } from './chat/chat.component';
import { ChatDetailComponent } from './chat-detail/chat-detail.component';

import { PickerModule } from '@ctrl/ngx-emoji-mart';

@NgModule({
  declarations: [
    AppComponent,

    MessagesComponent,
    ChatComponent,
    ChatDetailComponent,


  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    PickerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
