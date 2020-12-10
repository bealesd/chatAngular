import { Component, OnInit } from '@angular/core';
import { CryptoService } from '../services/crypto.service';
// import { MenuService } from '../services/menu.service';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {
  show: boolean;

  constructor(
    private cryptoService: CryptoService,
    // private menuSerivce: MenuService
  ) { }

  ngOnInit(): void {
    // this.menuSerivce.activateRoute('new-user-click');
  }

  createNewUser(username: string, password: string) {
    this.cryptoService.createNewUser(username, password);
  }

  showPassword() {
    this.show = !this.show;
  }

}
