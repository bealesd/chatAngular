import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LoginService } from '../services/login.service';

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
    private router: Router,
  ) {
    this.show = false;

    this.loginService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
      if (loggedIn === true) {
        this.router.navigate(['/apps']);
        this.setTheme();
      }
      else {
        this.resetTheme();
      }

    });
  }

  ngOnInit(): void {  }

  login(username: string, password: string) {
    this.loginService.login(username, password);
  }

  showPassword() {
    throw new Error("doh");
    this.show = !this.show;
  }

  resetTheme() {
    document.body.className = '';
  }

  setTheme() {
    const username = 'esther'
    if (username.toLowerCase() === 'admin' || username.toLowerCase() === 'esther')
      document.body.classList.add('dark');
    else
      document.body.className = '';
  }

}
