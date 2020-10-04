import { Component, OnInit } from '@angular/core';

import { ChatService } from '../services/chat.service';
import { MessageService } from '../services/message.service';

import { CryptoService } from '../services/crypto.service';
import { LoginHelper } from './loginHelper';
import { reduce } from 'rxjs/operators';

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
    private messageService: MessageService,
    private loginHelper: LoginHelper,
  ) {
    this.show = false;
    this.names = this.loginHelper.names;
  }

  ngOnInit(): void {
    this.loginHelper.setPerson();
    this.who = this.loginHelper.who;

    this.tryLogin('Auto');
  }

  login() {
    const citherKey = (<HTMLInputElement>document.querySelector('#login')).value;
    const loginTime = new Date().toString();

    this.cryptoService.login(citherKey, loginTime);

    this.tryLogin('');
  }

  password() {
    this.show = !this.show;
  }

  tryLogin(type: string) {
    this.chatService.login(type).subscribe((result) => {
      if (result === undefined) {
        this.messageService.add('Login failure.');
        this.loggedIn = false;
        document.querySelector('#logout-click').classList.add('disabled-menu-item');
        (<any>document.querySelector('#logout-click')).style.backgroundColor = 'red';
        document.querySelector('#login-click').classList.remove('disabled-menu-item');
      }
      else {
        this.messageService.add('Login complete.');
        this.loggedIn = true;
        document.querySelector('#login-click').classList.add('disabled-menu-item');
        document.querySelector('#logout-click').classList.remove('disabled-menu-item');
      }
    }, error => {
      this.messageService.add('Login failure.');
    });
  }

  changePerson(person) {
    this.loginHelper.changePerson(person);
    this.who = person;
  }
}
