import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Utilities } from './helpers/utilities-helper';
import { MessageService } from './services/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
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
