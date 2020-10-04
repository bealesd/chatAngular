import { Component, OnInit } from '@angular/core';
import { CryptoService } from '../services/crypto.service';
import { LoginHelper } from '../login/loginHelper'
import { Router } from '@angular/router';
import { RecieveChat } from '../models/recieve-chat.model';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent implements OnInit {
  chatMessages: RecieveChat[];

  constructor(
    private cryptoService: CryptoService,
    private router: Router,
    private loginHelper: LoginHelper,
    private messageService: MessageService,
  ) {
  }

  async ngOnInit(): Promise<void> {
  }

  async ngAfterViewInit(): Promise<void> {
    await this.loadMenu();
    document.querySelector('#about-click').addEventListener('click', () => {
      alert(
        `This website is made by David Beales.
It is for managing my apps like an OS.
It is serverless, thanks to GitHub API.`
      )
    });

    document.querySelector('#login-click').addEventListener('click', () => {
      this.router.navigate(['login'], { queryParams: { 'loggedIn': false } });
    })

    document.querySelector('#logout-click').addEventListener('click', () => {
      this.logout();
    })

    document.querySelector('#chat-click').addEventListener('click', () => {
      this.router.navigate(['chat']);
    })

    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    }
    this.router.onSameUrlNavigation = 'reload';
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
