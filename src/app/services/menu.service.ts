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
    if(this.events.hasOwnProperty(id)) {
      this.events[id].forEach((cb)=>{document.querySelector(`#${id}`).removeEventListener('click', cb)});
    }

    document.querySelector(`#${id}`).classList.add('disabled');
    (<any>document.querySelector(`#${id}`)).style.color = 'lightgrey';
  }

  enableMenuItem(id, callabck) {
    document.querySelector(`#${id}`).classList.remove('disabled');
    (<any>document.querySelector(`#${id}`)).style.color = '';
    // disable on hover

    if(!this.events.hasOwnProperty(id)) this.events[id] = [];

    const cb = () => {
      callabck();
    }

    this.events[id].push(cb);

    document.querySelector(`#${id}`).addEventListener('click', cb);
  }

  closeMenu() {
    document.querySelectorAll('.gm-sub-menu-container').forEach((container) => {
      if (!container.classList.contains('gm-hidden'))
        container.classList.add('gm-hidden');
    });
    window['GridMenu'].menuItems.forEach(menuItem => {
      menuItem.showChildren = false;
    });
  }

  setupMenuEvents() {
    document.querySelector('#about-click').addEventListener('click', () => {
      this.closeMenu();

      alert(
        `This website is made by David Beales.
It is for managing my apps like an OS.
It is serverless, thanks to GitHub API.`
      );
    });

    document.querySelector('#login-click').addEventListener('click', () => {
      this.closeMenu();
      if (this.loggedIn) alert('Already logged in.');
      else this.router.navigate(['login']);
    });

    document.querySelector('#logout-click').addEventListener('click', () => {
      this.closeMenu();
      if (this.loggedIn === false && this.router.url === '/login') alert('Already logged out.');
      else this.logout();
    });

    document.querySelector('#chat-click').addEventListener('click', () => {
      this.closeMenu();
      this.router.navigate(['chat']);
    });

    document.querySelector('#calendar-click').addEventListener('click', () => {
      this.closeMenu();
      this.router.navigate(['calendar']);
    });

    // this.router.routeReuseStrategy.shouldReuseRoute = () => { return false; }
    // this.router.onSameUrlNavigation = 'reload';
  }

}
