import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component'

import { CalendarMainComponent } from './calendar-main/calendar-main.component';
import { ChatComponent } from './chat-main/chat-main.component';
import { TodoComponent } from './todo/todo.component';
import { AppsComponent } from './apps/apps.component';
import { NewUserComponent } from './new-user/new-user.component';
import { NotepadComponent } from './notepad/notepad.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'newUser', component: NewUserComponent },
  { path: 'apps', component: AppsComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'calendar', component: CalendarMainComponent },
  { path: 'todo', component: TodoComponent },
  { path: 'notepad', component: NotepadComponent },
  { path: '**', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
