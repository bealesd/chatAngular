import { Component, OnInit } from '@angular/core';
import { MenuService } from '../services/menu.service';

@Component({
  selector: 'app-component',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.css']
})
export class AppsComponent implements OnInit {
  constructor(private menuSerivce: MenuService) { }

  ngOnInit(): void {
    this.menuSerivce.activateRoute('home-click');
  }

  customAlert(message) {
    alert(message);
  }

}
