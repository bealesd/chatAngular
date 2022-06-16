import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { LoginService } from './services/login.service';

import { MessageService } from './services/message.service';
import { ProfileService } from './services/profile.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isLoggingOn: boolean = false;

  constructor(
    private router: Router,
    private readonly updates: SwUpdate,
    private messageService: MessageService,
    private profileService: ProfileService,
    private loginService: LoginService
  ) {
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd)
        this.profileService.loadTheme();
    });

    this.updates.available.subscribe(event => {
      this.showAppUpdateAlert();
    });

    this.messageService.isLoggingOn
      .subscribe(isLoggingOn => {
        this.isLoggingOn = isLoggingOn;
      });

      this.loginService.tryLoginWithLocalToken();
  }

  showAppUpdateAlert() {
    if (confirm('App Update Available!'))
      this.doAppUpdate;
  }
  
  doAppUpdate() {
    this.updates.activateUpdate().then(() => document.location.reload());
  }

}
