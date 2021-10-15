import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {
  show: boolean;

  constructor(
  ) { }

  ngOnInit(): void {  }

  createNewUser(username: string, password: string) {
  }

  showPassword() {
    this.show = !this.show;
  }

}
