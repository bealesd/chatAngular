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

  constructor(
    public loginService: LoginService,
    private messageService: MessageService,
    private profileService: ProfileService,
  ) {
  }

  get pageTitle(){
    return window['pageTitle'] ? window['pageTitle'] : 'unknown';
  }

  get toolInfo(){
    return window['toolInfo'] ? window['toolInfo'] : 
      [null, undefined, ""].includes(LoginService.username.trim()) ?'Please Login' : `${LoginService.username} online`;
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
