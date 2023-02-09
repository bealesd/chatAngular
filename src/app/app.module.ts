import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { GlobalErrorHandler } from './helpers/global-error-handler';
import { ServerErrorInterceptor } from './helpers/server-error-interceptor';

import { MessagesComponent } from './messages/messages.component';
import { ChatComponent } from './chat-main/chat-main.component';
import { ChatDetailComponent } from './chat-detail/chat-detail.component';
import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { DialogBoxComponent } from './dialog-box/dialog-box.component';
import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { CalendarMainComponent } from './calendar-main/calendar-main.component';
import { TodoComponent } from './todo/todo.component';
import { CalendarMonthComponent } from './calendar-month/calendar-month.component';
import { CalendarWeekComponent } from './calendar-week/calendar-week.component';
import { CalendarFormComponent } from './calendar-form/calendar-form.component';
import { CalendarDayComponent } from './calendar-day/calendar-day.component';
import { NewUserComponent } from './new-user/new-user.component';
import { NotepadComponent } from './notepad/notepad.component';
import { ProfileComponent } from './profile/profile.component';
import { ChatGroupComponent } from './chat-group/chat-group.component';
import { ChatGroupCreateComponent } from './chat-group-create/chat-group-create.component';
import { WeighInComponent } from './weigh-in/weigh-in.component';
import { WeighInGraphComponent } from './weigh-in-graph/weigh-in-graph.component';
import { NgChartsModule } from 'ng2-charts';

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
    TodoComponent,
    CalendarMonthComponent,
    CalendarWeekComponent,
    CalendarFormComponent,
    CalendarDayComponent,
    NewUserComponent,
    NotepadComponent,
    ProfileComponent,
    ChatGroupComponent,
    ChatGroupCreateComponent,
    WeighInComponent,
    WeighInGraphComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    FormsModule,

    ReactiveFormsModule,

    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),

    NgChartsModule,
  ],
  providers: [
    { provide: DatePipe },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorInterceptor, multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
