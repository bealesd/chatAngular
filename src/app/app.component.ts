import { Component, isDevMode } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Utilities } from './helpers/utilities-helper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isDevMode: boolean = isDevMode();

  constructor(
    private router: Router,
    private utilities: Utilities
  ) {
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        if (ev.url === "/todo") {
          this.utilities.updateTheme('todo');
        }
        else {
          this.utilities.defaultTheme();
        }
      }
    });
  }

}
