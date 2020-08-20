import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chatAngular';

  constructor(){  }

}

//TODO create a login page that runs an intial authenticated get request to confirm login is correct, if not stay on login page.
