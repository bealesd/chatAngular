import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { MessageService } from '../services/message.service';
import { ProfileService } from '../services/profile.service';

import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

@Component({
  selector: 'app-component',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.css']
})
export class AppsComponent implements OnInit {
  // add sub menus in here for a page based on url path
  sideMenus: Object =
    {
      '/weighIns': {
        menu: [
          {
            routerLink: null,
            class: 'parent-menu',
            tooltip: 'Weigh Ins Area',
            name: 'Weigh Ins'
          },
          {
            routerLink: '/weighIns',
            class: 'child-menu',
            tooltip: 'Weights',
            name: 'Weights'
          },
          {
            routerLink: '/weighInsGraph',
            class: 'child-menu',
            tooltip: 'Graph',
            name: 'Graph'
          }
        ]
      }
    };

  loggedIn: boolean;
  location: Location;

  constructor(
    public loginService: LoginService,
    private messageService: MessageService,
    private profileService: ProfileService,
    public router: Router,
    location: Location
  ) {
    this.loginService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
      this.location = location;
    });
  }

  get username() {
    return LoginService.username;
  }

  get urlPath() {
    return this.location.path();
  }

  ngOnInit(): void {
    window['pageTitle'] = 'applications';
    window['toolInfo'] = '';
  }

  over(e: Event) {
    window['toolInfo'] = e.target['title'] ?? '';
  }

  test(ef: Object) {
    alert(JSON.stringify(ef))
  }

  out(e: Event) {
    window['toolInfo'] = ``;
  }

  toggleDarkMode() {
    this.profileService.toggleTheme();
  }

  logout() {
    this.loginService.logout();
    this.router.navigate(['login']);
  }

  toggleLogs() {
    const value = !this.messageService.isLoggingOn.value;
    this.messageService.isLoggingOn.next(value);
  }
}
