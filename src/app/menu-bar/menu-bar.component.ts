import { Component, OnInit } from '@angular/core';

import { ChatService } from '../services/chat.service';
import { MenuService } from '../services/menu.service';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent implements OnInit {
  loggedIn: boolean;

  constructor(
    private chatService: ChatService,
    private menuService: MenuService
  ) {

    this.chatService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
  }

  async ngOnInit(): Promise<void> {
  }

  async ngAfterViewInit(): Promise<void> {
    await this.loadMenu();

    this.menuService.setupMenuEvents();

    this.menuService.disableMenuItem('todo-click');

    this.menuService.disableMenuItem('cancel-click');
    this.menuService.disableMenuItem('delete-click');
    this.menuService.disableMenuItem('save-click');

    this.menuService.disableMenuItem('undo-click');

    this.menuService.disableMenuItem('day-click');
    this.menuService.disableMenuItem('week-click');
    this.menuService.disableMenuItem('month-click');

    (<any>document.querySelector('#home-click')).style.borderBottom = '2px dotted grey';

    (<any>document.querySelector('#save-click')).style.borderBottom = '2px dotted grey';
  }

  async loadMenu(): Promise<void> {
    await window['GridMenu'].load();
  }
}
