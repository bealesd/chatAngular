import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CryptoService } from '../services/crypto.service';

import { LoginService } from '../services/login.service';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent implements OnInit {
  loggedIn: boolean;

  constructor(
    private loginService: LoginService,
    public cryptoService: CryptoService,
    private messageService: MessageService,
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

  logout() {
    this.cryptoService.logout();
    this.loginService.loggedIn.next(false);

    this.messageService.add('Logged out.');

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['login']);
  }

}
