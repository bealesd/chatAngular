import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ChatService } from './../chat.service';
import { MessageService } from './../message.service';

import { CryptoService } from '../auth/cryptoService';
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

  constructor(
    private cryptoService: CryptoService,
    private chatService: ChatService,
    private router: Router,
    private messageService: MessageService,
    private loginHelper: LoginHelper
  ) {
    this.show = false;
    this.names = this.loginHelper.names;
  }

  ngOnInit(): void {
    this.loginHelper.setPerson();

    this.tryLogin();
  }

  login() {
    const citherKey = (<HTMLInputElement>document.querySelector('#login')).value;
    const loginTime = new Date().toString();


    this.cryptoService.login(citherKey, loginTime);

    this.tryLogin();
  }

  password() {
    this.show = !this.show;
  }

  tryLogin() {
    this.chatService.login().subscribe((result) => {
      this.messageService.add('success');
      this.router.navigate(['chat']);
    }, error => {
      this.messageService.add('Wrong Password');
    });
  }

  changePerson(person){
    this.loginHelper.changePerson(person);
    this.who = person;
  }
}
