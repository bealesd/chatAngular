import { Component, OnInit } from '@angular/core';

import { LoginService } from '../services/login.service';
import { MenuService } from '../services/menu.service';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent implements OnInit {
  loggedIn: boolean;

  constructor(
    private loginService: LoginService,
    private menuService: MenuService,
  ) {

    this.loginService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
  }

  async ngOnInit(): Promise<void> {
  }

  async ngAfterViewInit(): Promise<void> {
    await window['GridMenu'].load();
    this.setup();
  }

  setup() {
    this.menuService.setupMenuEvents();

    this.menuService.disableMenuItem('delete-click');
    this.menuService.disableMenuItem('save-click');
    this.menuService.disableMenuItem('close-click');

    this.menuService.disableMenuItem('undo-click');

    this.menuService.disableMenuItem('day-click');
    this.menuService.disableMenuItem('week-click');
    this.menuService.disableMenuItem('month-click');

    (<any>document.querySelector('#home-click')).style.borderBottom = '2px dotted grey';

    (<any>document.querySelector('#close-click')).style.borderBottom = '2px dotted grey';
  }

}
