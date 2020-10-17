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

    this.menuService.disableMenuItem('save-click');
    this.menuService.disableMenuItem('undo-click');
  }

  // TODO - move to gridmenu codebase

  async loadMenu(): Promise<void> {
    await window['GridMenu'].load();
  }
}
