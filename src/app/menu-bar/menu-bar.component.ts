import { Component, OnInit } from '@angular/core';
import { CryptoService } from '../services/crypto.service';
import { Router } from '@angular/router';
import { MessageService } from '../services/message.service';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent implements OnInit {
  loggedIn: boolean;

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

  async ngOnInit(): Promise<void> {
  }

  async ngAfterViewInit(): Promise<void> {
    await this.loadMenu();

    // TODO unclick menu on option clicked

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

      if (this.loggedIn)
        alert('Already logged in.');
      else
        this.router.navigate(['login']);
    });

    document.querySelector('#logout-click').addEventListener('click', () => {
      this.closeMenu();

      if (this.loggedIn === false && this.router.url === '/login')
        alert('Already logged out.');
      else
        this.logout();
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

  // TODO - move to gridmenu codebase
  closeMenu() {
    document.querySelectorAll('.gm-sub-menu-container').forEach((container) => {
      if (!container.classList.contains('gm-hidden'))
        container.classList.add('gm-hidden');
    });
    window['GridMenu'].menuItems.forEach(menuItem => {
      menuItem.showChildren = false;
    });
  }

  async loadMenu(): Promise<void> {

    await window['GridMenu'].load();
  }

  logout() {
    if (confirm('Do you want to logout?')) {
      this.cryptoService.logout();

      this.messageService.add('Logged out.');

      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate(['login']);
    }
  }
}
