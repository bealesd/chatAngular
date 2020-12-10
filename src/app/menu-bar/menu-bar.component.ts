import { Component, OnInit } from '@angular/core';

import { LoginService } from '../services/login.service';
// import { MenuService } from '../services/menu.service';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.css']
})
export class MenuBarComponent implements OnInit {
  loggedIn: boolean;

  constructor(
    private loginService: LoginService,
    // private menuService: MenuService,
  ) {

    this.loginService.loggedIn.subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
  }

  async ngOnInit(): Promise<void> {
  }

  async ngAfterViewInit(): Promise<void> {
  }

}
