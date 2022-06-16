import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LoginService } from '../services/login.service';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  show: boolean;
  names: string[];
  who: any;
  loggedIn: boolean;

  constructor(
    private loginService: LoginService,
    private profileService: ProfileService,
    private router: Router,
  ) {
    this.show = false;

    this.loginService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
      if (loggedIn === true) {
        this.profileService.loadTheme();
        this.router.navigate(['/chatGroup']);   
      }
      else {
        this.resetTheme();
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnInit(): void { 
    window['toolInfo'] = '';
    window['pageTitle'] = 'Login';

    this.loginService.tryLoginWithLocalToken();
   }

  async login(username: string, password: string) {
    await this.loginService.login(username, password);
  }

  showPassword() {
    this.show = !this.show;
  }

  resetTheme() {
    document.body.className = 'dark';
  }

  setTheme() {
    if (LoginService.username.toLowerCase() === 'esther')
      document.body.classList.add('dark');
    else if(LoginService.username.toLowerCase() === 'david')
      document.body.classList.add('dave');
    else
      document.body.className = 'light';
  }

}
