import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';

import { MessagesComponent } from './messages/messages.component';
import { ChatComponent } from './chat-main/chat-main.component';
import { ChatDetailComponent } from './chat-detail/chat-detail.component';

//emoji issue?
import { PickerModule } from '@ctrl/ngx-emoji-mart';

import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { DialogBoxComponent } from './dialog-box/dialog-box.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CalendarMainComponent } from './calendar-main/calendar-main.component';
import { AppsComponent } from './apps/apps.component';
import { TodoComponent } from './todo/todo.component';
import { CalendarMonthComponent } from './calendar-month/calendar-month.component';
import { CalendarWeekComponent } from './calendar-week/calendar-week.component';
import { CalendarFormComponent } from './calendar-form/calendar-form.component';
import { CalendarDayComponent } from './calendar-day/calendar-day.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { NewUserComponent } from './new-user/new-user.component';

@NgModule({
  declarations: [
    AppComponent,

    MessagesComponent,
    ChatComponent,
    ChatDetailComponent,
    LoginComponent,
    DialogBoxComponent,
    MenuBarComponent,
    CalendarMainComponent,
    AppsComponent,
    TodoComponent,
    CalendarMonthComponent,
    CalendarWeekComponent,
    CalendarFormComponent,
    CalendarDayComponent,
    NewUserComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    PickerModule,
    AppRoutingModule,
    FormsModule,

    ReactiveFormsModule,

    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
