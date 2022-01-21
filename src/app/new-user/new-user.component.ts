import { Component, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {
  show: boolean;

  constructor(public loginService: LoginService) { }

  ngOnInit(): void {  }

  async createNewUser(username: string, password: string) {
    const result = await this.loginService.addUser({username: username, password: password});
    if (result){
      alert(`Added new user: ${username}.`);
      this.clearForm();
    }
      
  }

  clearForm(){
    (document.querySelector('#usernameInput') as HTMLInputElement).value = '';
    (document.querySelector('#passwordInput') as HTMLInputElement).value = '';
  }

  showPassword() {
    this.show = !this.show;
  }

}
