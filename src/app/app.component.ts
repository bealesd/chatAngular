import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Utilities } from './helpers/utilities-helper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
    private router: Router) {
    const utilities = new Utilities();

    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        if (ev.url === "/todo") {
          utilities.updateTheme('todo');
        }
        else {
          utilities.defaultTheme();
        }
      }
    });
  }

}
