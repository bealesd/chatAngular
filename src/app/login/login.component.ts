import { Component, OnInit } from '@angular/core';

import { ChatService } from '../services/chat.service';

import { CryptoService } from '../services/crypto.service';
import { LoginHelper } from './loginHelper';

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
    private chatService: ChatService,
    private loginHelper: LoginHelper,
  ) {
    this.show = false;
    this.names = this.loginHelper.names;

    this.chatService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
  }

  ngOnInit(): void {
    this.loginHelper.setPerson();
    this.who = this.loginHelper.who;
  }

  login() {
    const citherKey = (<HTMLInputElement>document.querySelector('#login')).value;
    const loginTime = new Date().toString();

    this.cryptoService.login(citherKey, loginTime);

    this.chatService.tryLogin('');
  }

  password() {
    this.show = !this.show;
  }

  changePerson(person) {
    this.loginHelper.changePerson(person);
    this.who = person;
  }
}
