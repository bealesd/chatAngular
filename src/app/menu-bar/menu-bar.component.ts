import { Component, OnInit } from '@angular/core';
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
  loggedIn: boolean;

  constructor(
    public loginService: LoginService,
    private messageService: MessageService,
    private profileService: ProfileService,
    private router: Router
  ) {

    this.loginService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
  }

  async ngOnInit(): Promise<void> {
  }

  async ngAfterViewInit(): Promise<void> {
  }

  toggleDarkMode(){
    this.profileService.toggleTheme();
  }

  logout() {
    this.loginService.loggedIn.next(false);

    this.messageService.add('Logged out.');

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['login']);
  }

  toggleLogs(){
    const value = !this.messageService.isLoggingOn.value;
    this.messageService.isLoggingOn.next(value);
  }

}
