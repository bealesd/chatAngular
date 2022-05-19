import { Component, OnInit } from '@angular/core';

import { LoginService } from '../services/login.service';
import { MessageService } from '../services/message.service';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent implements OnInit {
  loggedIn: boolean;

  constructor(
    public loginService: LoginService,
    private messageService: MessageService,
    private profileService: ProfileService,
  ) {

    this.loginService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
  }

  get pageTitle(){
    return window['pageTitle'] ? window['pageTitle'] : 'unknown';
  }

  get toolInfo(){
    return window['toolInfo'] ? window['toolInfo'] : 
      [null, undefined, ""].includes(LoginService.username.trim()) ?'Please Login' : `Hi ${LoginService.username}`;
  }

  async ngOnInit(): Promise<void> {
  }

  async ngAfterViewInit(): Promise<void> {
  }

  toggleDarkMode(){
    this.profileService.toggleTheme();
  }

  toggleLogs(){
    const value = !this.messageService.isLoggingOn.value;
    this.messageService.isLoggingOn.next(value);
  }

}
