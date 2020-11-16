import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { CryptoService } from '../services/crypto.service';
import { MessageService } from '../services/message.service';
import { LoginService } from './login.service';

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
    private loginService: LoginService
  ) {
    this.loginService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
  }

  logout() {
    if (confirm('Do you want to logout?')) {
      this.cryptoService.logout();
      this.loginService.loggedIn.next(false);

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
        else {
          this.logout();
          this.activateRoute('logout-click');
        }
      });

    this.registerMenuEvent('new-user-click',
      () => {
        this.hideMenu();
        this.router.navigate(['newUser']);
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

    this.registerMenuEvent('todo-click',
      () => {
        this.hideMenu();
        this.router.navigate(['todo']);
      });

      this.registerMenuEvent('notepad-click',
      () => {
        this.hideMenu();
        this.router.navigate(['notepad']);
      });
  }

  deactivateRoutes() {
    const menuItems = window['GridMenu'].getMenuItemsAll().filter(item => item.html.id.trim() !== "");
    menuItems.forEach(item => item.html.classList.remove('active-link'));
  }

  activateRoute(menuId) {
    this.deactivateRoutes();
    window['GridMenu'].getMenuItemsAll().find(item => item.html.id === menuId).html.classList.add('active-link');
  }


}
