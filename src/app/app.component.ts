import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Utilities } from './helpers/utilities-helper';
import { SwUpdate } from '@angular/service-worker';

import { MessageService } from './services/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isLoggingOn: boolean = false;

  constructor(
    private router: Router,
    private utilities: Utilities,
    private readonly updates: SwUpdate,
    private messageService: MessageService,
  ) {
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        if (ev.url === "/todo") {
          this.utilities.updateTheme('todo');
        }
        else {
          this.utilities.defaultTheme();
        }
      }
    });

    this.updates.available.subscribe(event => {
      this.showAppUpdateAlert();
    });

    this.messageService.isLoggingOn
      .subscribe(isLoggingOn => {
        this.isLoggingOn = isLoggingOn;
      });
  }

  showAppUpdateAlert() {
    if (confirm('App Update available')) {
      this.doAppUpdate;
    };
  }
  doAppUpdate() {
    this.updates.activateUpdate().then(() => document.location.reload());
  }

}
