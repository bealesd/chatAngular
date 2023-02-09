import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { LoginService } from '../services/login.service';
import { MessageService } from '../services/message.service';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent implements OnInit {
  // add sub menus in here for a page based on url path
  // side menu router links mist be prefixed with parent key
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
  sidebarOpen: boolean = false;

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

  get pageTitle() {
    return window['pageTitle'] ? window['pageTitle'] : 'unknown';
  }

  get toolInfo() {
    return window['toolInfo'] ? window['toolInfo'] :
      [null, undefined, ""].includes(LoginService.username.trim()) ? 'Please Login' : `${LoginService.username} online`;
  }

  get username() {
    return LoginService.username;
  }

  get urlPath() {
    return this.location.path();
  }

  get isSideMenu(){
    return Object.keys(this.sideMenus).findIndex(sideMenu => this.urlPath.includes(sideMenu)) === 0;
  }
  
  get getSideMenuForUrl(){
    if (this.isSideMenu)
      return this.sideMenus[Object.keys(this.sideMenus).find(sideMenu => this.urlPath.includes(sideMenu))]
    
      this.messageService.add(`Apps component: could not find side menu for url: ${this.urlPath}`, 'error');   
  }

  async ngOnInit(): Promise<void> {
    window['pageTitle'] = 'applications';
    window['toolInfo'] = '';
  }

  async ngAfterViewInit(): Promise<void> {
  }

  over(e: Event) {
    window['toolInfo'] = e.target['title'] ?? '';
  }

  out(e: Event) {
    window['toolInfo'] = ``;
  }

  toggleDarkMode() {
    this.profileService.toggleTheme();
  }

  toggleLogs() {
    const value = !this.messageService.isLoggingOn.value;
    this.messageService.isLoggingOn.next(value);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.loginService.logout();
    this.router.navigate(['login']);
    
    this.closeSideBar();
  }

  closeSideBar(){
    this.sidebarOpen = false;
  }
}
