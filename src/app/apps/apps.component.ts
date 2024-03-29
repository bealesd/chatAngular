import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { MessageService } from '../services/message.service';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-component',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.css']
})
export class AppsComponent implements OnInit {
  loggedIn: boolean;

  constructor(
    public loginService: LoginService,
    private messageService: MessageService,
    private profileService: ProfileService,
    public router: Router
  ) {
    this.loginService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
  }

  get username() {
    return LoginService.username;
  }

  ngOnInit(): void {
    window['pageTitle'] = 'applications';
    window['toolInfo'] = '';
  }

  over(e: Event) {
    window['toolInfo'] = e.target['title'] ?? '';
  }

  out(e: Event) {
    window['toolInfo'] = '';
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
