import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LoginService } from '../services/login.service';
import { CryptoService } from '../services/crypto.service';
import { LoginHelper } from '../helpers/login-helper';

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
    private cryptoService: CryptoService,
    private loginService: LoginService,
    private loginHelper: LoginHelper,
    private router: Router,
  ) {
    this.show = false;
    this.names = this.loginHelper.names;

    this.cryptoService.logout();

    this.loginService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
      if(loggedIn === true)
        this.router.navigate(['/apps']);
    });
  }

  ngOnInit(): void {
    this.loginHelper.setPerson();
    this.who = this.loginHelper.who;
  }

  login() {
    const citherKey = (<HTMLInputElement>document.querySelector('#login')).value;
    this.cryptoService.encryptCredentials(citherKey);

    this.loginService.login();
  }

  password() {
    this.show = !this.show;
  }

  changePerson(person) {
    this.loginHelper.changePerson(person);
    this.who = person;
  }
}
