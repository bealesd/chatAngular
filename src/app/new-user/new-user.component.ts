import { Component, OnInit } from '@angular/core';
import { CryptoService } from '../services/crypto.service';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css']
})
export class NewUserComponent implements OnInit {
  show: boolean;

  constructor(
    private cryptoService: CryptoService,
  ) { }

  ngOnInit(): void {  }

  createNewUser(username: string, password: string) {
    this.cryptoService.createNewUser(username, password);
  }

  showPassword() {
    this.show = !this.show;
  }

}
