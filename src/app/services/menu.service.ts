import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { CryptoService } from '../services/crypto.service';
import { MessageService } from '../services/message.service';
import { ChatService } from '../services/chat.service';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  loggedIn: boolean;
  events: {} = {};

  constructor(
    private cryptoService: CryptoService,
    private router: Router,
    private messageService: MessageService,
    private chatService: ChatService
  ) {
    this.chatService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
  }

  logout() {
    if (confirm('Do you want to logout?')) {
      this.cryptoService.logout();
      this.chatService.loggedIn.next(false);

      this.messageService.add('Logged out.');

      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate(['login']);
    }
  }

  disableMenuItem(id) {
    window['GridMenu'].disableMenuItem(id);
  }

  enableMenuItem(id, callabck) {
    window['GridMenu'].enableMenuItem(id);
    this.registerMenuEvent(id, callabck);
  }

  hideMenu() {
    window['GridMenu'].hideMenu();
  }

  registerMenuEvent(id, callback) {
    window['GridMenu'].addMenuItemClickEvent(id, () => callback());
  }

  setupMenuEvents() {
    this.registerMenuEvent('about-click',
      () => {
        this.hideMenu();
        alert(
          `This website is made by David Beales.
It is for managing my apps like an OS.
It is serverless, thanks to GitHub API.`
        );
      });

    this.registerMenuEvent('login-click',
      () => {
        this.hideMenu();
        if (this.loggedIn) alert('Already logged in.');
        else this.router.navigate(['login']);
      });

    this.registerMenuEvent('logout-click',
      () => {
        this.hideMenu();
        if (this.loggedIn === false && this.router.url === '/login') alert('Already logged out.');
        else this.logout();
      });

      this.registerMenuEvent('home-click',
      () => {
        this.hideMenu();
        this.router.navigate(['apps']);
      });

    this.registerMenuEvent('chat-click',
      () => {
        this.hideMenu();
        this.router.navigate(['chat']);
      });

    this.registerMenuEvent('calendar-click',
      () => {
        this.hideMenu();
        this.router.navigate(['calendar']);
      });

    // this.router.routeReuseStrategy.shouldReuseRoute = () => { return false; }
    // this.router.onSameUrlNavigation = 'reload';
  }

}
