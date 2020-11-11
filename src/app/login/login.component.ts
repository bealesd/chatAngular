import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LoginService } from '../services/login.service';
import { CryptoService } from '../services/crypto.service';
import { LoginHelper } from '../helpers/login-helper';
import { MenuService } from '../services/menu.service';

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
    private menuSerivce: MenuService
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
    this.menuSerivce.activateRoute('login-click');
  }

  login(username:string, password:string) {
    this.cryptoService.encryptCredentials(username, password);

    this.loginService.login();
  }

  showPassword() {
    this.show = !this.show;
  }

  changePerson(person) {
    this.loginHelper.changePerson(person);
    this.who = person;
  }
}
